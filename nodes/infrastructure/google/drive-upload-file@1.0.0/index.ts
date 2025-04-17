import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { URL } from "url";
import { Buffer } from "buffer";
import fs from "fs";

export default class GoogleDriveUploadFile extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            this.validate(ctx);

            let opts = ctx.config as any;
            opts = opts[this.name];

            const googleConfig = opts.inputs.googleConfig;
            const isLocal = opts.inputs.isLocal;
            const filePathOrUrl = opts.inputs.filePathOrUrl;
            const fileName = opts.inputs.fileName || this.getFileNameFromUrl(filePathOrUrl, isLocal);
            const mimeType = opts.inputs.mimeType || "application/octet-stream";
            const path = opts.inputs.path || "";

            const accessToken = await this.getAccessToken(googleConfig);

            const fileBuffer = isLocal
                ? await this.readFile(filePathOrUrl)
                : await this.downloadFile(filePathOrUrl);

            // Get the folder ID for the specified path
            const folderId = await this.getFolderId(accessToken, path);

            const uploadedFileData = await this.uploadFileToDrive(
                accessToken,
                fileBuffer,
                fileName,
                mimeType,
                folderId
            );

            response.data = uploadedFileData;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    validate(ctx: BlueprintContext) {
        if (!ctx.config) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (!opts?.inputs?.googleConfig) throw new Error(`${this.name} requires googleConfig`);
        if (!opts?.inputs?.filePathOrUrl) throw new Error(`${this.name} requires a filePathOrUrl`);
    }

    getFileNameFromUrl(url: string, isLocal: boolean): string {
        if (url === undefined || url === 'undefined') {
            return "downloaded_file";
        }

        if (isLocal) {
            return url.split("/").pop() || "downloaded_file";
        }
        const parsedUrl = new URL(url);
        return decodeURIComponent(parsedUrl.pathname.split("/").pop() || "downloaded_file");
    }

    async getAccessToken(googleConfig: any): Promise<string> {
        const { clientId, clientSecret, refreshToken } = googleConfig;

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(`Failed to obtain access token: ${errorData.error_description || "Unknown error"}`);
        }

        const tokenData = await tokenResponse.json();
        return tokenData.access_token;
    }

    async readFile(filePath: string): Promise<Buffer> {
        return fs.promises.readFile(filePath);
    }

    async downloadFile(url: string): Promise<Buffer> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    async getFolderId(accessToken: string, path: string): Promise<string | undefined> {
        if (!path) return undefined; // If no path is provided, upload to root

        const folders = path.split("/").filter(Boolean); // Split the path and remove empty strings
        let parentId = "root"; // Start from the root folder

        for (const folderName of folders) {
            const folderId = await this.findOrCreateFolder(accessToken, folderName, parentId);
            parentId = folderId; // Set the parentId to the current folderId for the next iteration
        }

        return parentId;
    }

    async findOrCreateFolder(
        accessToken: string,
        folderName: string,
        parentId: string
    ): Promise<string> {
        // First, try to find the folder
        const searchParams = new URLSearchParams();
        searchParams.append("q", `'${parentId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
        searchParams.append("fields", "files(id, name)");

        const response = await fetch(`https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to search for folder: ${errorData.error.message || "Unknown error"}`);
        }

        const data = await response.json();

        if (data.files && data.files.length > 0) {
            // Folder exists, return its ID
            return data.files[0].id;
        } else {
            // Folder does not exist, create it
            return await this.createFolder(accessToken, folderName, parentId);
        }
    }

    async createFolder(accessToken: string, folderName: string, parentId: string): Promise<string> {
        const metadata = {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentId],
        };

        const response = await fetch("https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create folder: ${errorData.error.message || "Unknown error"}`);
        }

        const folderData = await response.json();
        return folderData.id;
    }

    async uploadFileToDrive(
        accessToken: string,
        fileBuffer: Buffer,
        fileName: string,
        mimeType: string,
        folderId?: string
    ) {
        const metadata: any = {
            name: fileName,
        };

        if (folderId) {
            metadata.parents = [folderId];
        }

        const boundary = "boundary-" + Date.now();
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
            metadata
        )}`;
        const filePartHeader = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

        const multipartBody = Buffer.concat([
            Buffer.from(metadataPart, "utf8"),
            Buffer.from(filePartHeader, "utf8"),
            fileBuffer,
            Buffer.from(closeDelimiter, "utf8"),
        ]);

        const response = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": `multipart/related; boundary=${boundary}`,
                    "Content-Length": multipartBody.length.toString(),
                },
                body: multipartBody,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to upload file to Google Drive: ${errorData.error.message || "Unknown error"}`);
        }

        const fileData = await response.json();
        return fileData;
    }
}
