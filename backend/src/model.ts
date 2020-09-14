export interface BackendMetaData {
    version: string | null;
    started: Date | null;
}

export interface OcrResult {
    success: boolean;
    hash: string;
    data: string | undefined;
}
