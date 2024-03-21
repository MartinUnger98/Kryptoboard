import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { KryptoService } from '../services/krypto.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  kryptos = [
    {
      name: 'BTC',
      img: 'assets/img/bitcoin.svg',
    },
    {
      name: 'ETH',
      img: 'assets/img/etherium.svg',
    },
    {
      name: 'BNB',
      img: 'assets/img/bnb.svg',
    },
    {
      name: 'SOL',
      img: 'assets/img/solana.svg',
    },
    {
      name: 'LTC',
      img: 'assets/img/litecoin.svg',
    },
  ];

  private destroyed$ = new Subject<void>();


  constructor(private kryptoService: KryptoService) {}


  ngOnInit() {

  }

  onCarouselPageChange(event: any) {
    const currentKrypto = this.kryptos[event.page];
    this.setNewKrypto(currentKrypto.name);
  }


  setNewKrypto(newKrypto: string) {
    this.kryptoService.setCurrentCrypto(newKrypto);
  }



  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
