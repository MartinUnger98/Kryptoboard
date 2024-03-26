import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})

export class KryptoService {

  public currentKrypto$ = new BehaviorSubject<string>('BTC');
  public currentKryptoName$ = new BehaviorSubject<string>('bitcoin');

  kryptos$ = new BehaviorSubject<Object>([
    {
      name: 'bitcoin',
      short: 'BTC',
      img: 'assets/img/bitcoin.svg',
    },
    {
      name: 'ethereum',
      short: 'ETH',
      img: 'assets/img/etherium.svg',
    },
    {
      name: 'binancecoin',
      short: 'BNB',
      img: 'assets/img/bnb.svg',
    },
    {
      name: 'solana',
      short: 'SOL',
      img: 'assets/img/solana.svg',
    },
    {
      name: 'litecoin',
      short: 'LTC',
      img: 'assets/img/litecoin.svg',
    },
  ]);

  constructor( private router: Router) {}


  setCurrentCrypto(newKrypto: string, newKryptoName: string) {
    this.currentKrypto$.next(newKrypto);
    this.currentKryptoName$.next(newKryptoName);
  }


}
