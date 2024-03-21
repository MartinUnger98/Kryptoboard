import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})

export class KryptoService {

  public currentKrypto$ = new BehaviorSubject<string>('BTC');

  constructor( private router: Router) {}


  setCurrentCrypto(newCrypto: string) {
    this.currentKrypto$.next(newCrypto);
  }
}
