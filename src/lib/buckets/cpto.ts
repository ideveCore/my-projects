import { createCipheriv, createDecipheriv } from 'crypto';

export class CPTO {
	private algorithm: string;
	private key: Buffer;
	private iv: Buffer;

	constructor({ algorithm, key, iv }: { algorithm: string; key: string; iv: string }) {
		this.algorithm = algorithm;
		this.key = Buffer.from(key, 'hex');
		this.iv = Buffer.from(iv, 'hex');
	}

	public encrypt_content(buffer: Buffer): Buffer<ArrayBuffer> {
		const cipher = createCipheriv(this.algorithm, this.key, this.iv);
		let encrypted_data = cipher.update(buffer);
		return Buffer.concat([encrypted_data, cipher.final()]);
	}

	public decrypt_content(buffer: Buffer): Buffer {
		const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
		let decrypted_data = decipher.update(buffer);
		return Buffer.concat([decrypted_data, decipher.final()]);
	}
}
