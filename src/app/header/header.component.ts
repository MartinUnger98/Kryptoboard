import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  kryptos = [
    {
      img: 'assets/img/bitcoin.svg',
    },
    {
      img: 'assets/img/etherium.svg',
    },
  ]

  constructor() {}

}
