import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SimpleServiceService {

  constructor(private httpClient: HttpClient) { }

  get_new_address() {
    return this.httpClient.get("http://backend.localhost:3000/new_account");
  }

  generate_blocks(count: number) {
    return this.httpClient.get("http://backend.localhost:3000/generate_bitcoins?count=" + count);
  }

  get_balance() {
    return this.httpClient.get("http://backend.localhost:3000/get_balance");
  }

  send_btc(addy: string, amount: string) {
    return this.httpClient.get("http://backend.localhost:3000/send_bitcoins?address=" + addy + "&amount=" + amount);
  }
}
