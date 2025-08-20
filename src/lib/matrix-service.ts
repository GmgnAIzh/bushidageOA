import * as sdk from "matrix-js-sdk";

class MatrixService {
  private client: sdk.MatrixClient | null = null;

  public initializeClient() {
    if (this.client) {
      return this.client;
    }

    this.client = sdk.createClient({
      baseUrl: "https://matrix.org", // Using public server for development
    });

    return this.client;
  }

  public getClient(): sdk.MatrixClient {
    if (!this.client) {
      return this.initializeClient();
    }
    return this.client;
  }

  public async login(userId: string, accessToken: string): Promise<void> {
    if (!this.client) {
      this.initializeClient();
    }

    // In a real scenario, you'd use a password, but SDK often uses access tokens
    // For now, we'll just start the client assuming we have a token
    await this.client!.startClient({ initialSyncLimit: 10 });
  }

  // A more realistic login flow would be:
  public async loginWithPassword(user: string, pass: string): Promise<sdk.ILoginResponse> {
    const client = this.getClient();
    return client.login("m.login.password", { user, password: pass });
  }


  public async logout(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this.client = null;
    }
  }

  public isLoggedIn(): boolean {
    return this.client?.isLoggedIn() || false;
  }
}

export const matrixService = new MatrixService();
