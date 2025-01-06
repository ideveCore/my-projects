export class FS_TYPE {
	private mime_db_url: string = 'https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json';
	private db_mimetypes: {
		[key: string]: { source: string; compressible: boolean; extensions: string[] };
	} | null = null;

	public async build(): Promise<FS_TYPE> {
		const response = await fetch(this.mime_db_url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data: {
			[key: string]: { source: string; compressible: boolean; extensions: string[] };
		} = await response.json();
		this.db_mimetypes = data;
		return this;
	}

	public extension({
		type
	}: {
		type: string;
	}): string | { error: boolean; message: string; details?: string } {
		if (this.db_mimetypes) {
			if (this.db_mimetypes[type] && 'extensions' in this.db_mimetypes[type]) {
				return this.db_mimetypes[type].extensions[0];
			} else {
				return { error: true, message: 'Mimetype not found!' };
			}
			return type;
		} else {
			return { error: true, message: 'Mime type db not loaded!' };
		}
	}
}
