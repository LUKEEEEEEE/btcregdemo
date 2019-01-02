export class Address {

  address: string;
  btc_count: number;

  constructor(add: string, count: number) {
    this.address = add;
    this.btc_count = count;
  }
}
