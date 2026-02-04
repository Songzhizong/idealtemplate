export interface FileCatalog {
	id: string
	parentId: string | null
	name: string
	public: boolean
	deleted: boolean
	deleteTime?: string | null
	children?: FileCatalog[] | null
}

export interface FileCatalogTrees {
	all: FileCatalog[]
	active: FileCatalog[]
	recycled: FileCatalog[]
}

export interface CreateFileCatalogArgs {
	parentId: string | null
	name: string
}

export interface FileRecord {
	id: string
	catalogId: string
	objectId: string
	fileName: string
	contentType: string
	objectSize: string
	createdTime: string
	deleted: boolean
	deleteTime?: string | null
}

export interface QueryFileArgs {
	catalogId?: string
	filename?: string
}

export interface InitMultipartUploadArgs {
	originalName: string
	contentType: string
	public: boolean
}

export interface MultipartInitResp {
	uploadId: string
}

export interface ETag {
	partNumber: number
	eTag: string
}

export interface CompleteMultipartUploadArgs {
	etags: ETag[]
}

export type FileManagerItem =
	| {
			kind: "folder"
			id: string
			name: string
			parentId: string | null
			deleted: boolean
			deleteTime: string | null
			raw: FileCatalog
	  }
	| {
			kind: "file"
			id: string
			name: string
			contentType: string
			objectSize: string
			createdTime: string
			deleted: boolean
			deleteTime: string | null
			raw: FileRecord
	  }
