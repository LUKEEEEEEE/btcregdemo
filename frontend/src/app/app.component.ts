import {Component, OnInit} from '@angular/core';
import {SimpleServiceService} from "./services/simple-service.service";
import {Address} from "./models/address";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  new_btc_address: string = undefined;
  my_addresses: Array<Address> = [];


  constructor(private ss: SimpleServiceService){}

  generate_blocks(count: number) {
    this.ss.generate_blocks(count).subscribe(x => {
      console.log("successfully generated blocks");
      this.get_balance();
    })
  }

  list_tx(addy: string) {
    console.log(addy);
  }

  send_btc_to_addy(addy: string, count: string) {
    this.ss.send_btc(addy, count).subscribe(x =>
      this.generate_blocks(5)
    );
  }

  get_new_address() {
    this.ss.get_new_address().subscribe( data =>
      this.new_btc_address = data['result']
    )
  }

  get_balance() {
    this.ss.get_balance().subscribe(x => {
      let new_array: Array<Address> = [];
      for (const [addy, count] of Object.entries(x)) {
        new_array.push(new Address(addy, count))
      }
      this.my_addresses = new_array;
    });
    console.log("getting balance from btc node..")
  }

  ngOnInit(): void {
    this.get_balance();
  }

}
