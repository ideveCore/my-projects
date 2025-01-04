export class Request {
  private url: string;
  constructor({ url }: { url: string }) {
    this.url = url;
  }
  public async form(form: HTMLFormElement): Promise<any> {
    const form_data = new FormData(form);
    return await this.request(form_data);
  }

  private async request(data: FormData): Promise<any> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        body: data,
      });
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      return await response.json();
    } catch (error) {
      return error;
    }
  }
}