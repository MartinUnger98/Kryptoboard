interface PriceDateObject {
  price: string;
  date: string;
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { KryptoService } from '../services/krypto.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, OnDestroy{
  private destroyed$ = new Subject<void>();



  currentKrypto!: string;

  data: any;
  course: any = [];
  btc_coin_gecko!: number;
  url_coin_gecko: string = "https://api.coingecko.com/api/v3/coins/bitcoin";
  API_KEY: string = "CG-QNdDAkMhcmfZMRXThWCkqhGc";



  constructor(private kryptoService: KryptoService, private http: HttpClient) {}

  async ngOnInit() {
    this.subscribeObservables();
    await this.fillBTCcoinGecko();
    await this.fillBTCPricesLast30Days();
    this.setupChart();
  }


  setupChart() {
    this.data = {
        labels: this.course.map((item: PriceDateObject) => item.date.substring(5,10)), // Extrahiert das Jahr und den Monat
        datasets: [
            {
                label: `${this.currentKrypto} zu EUR`,
                data: this.course.map((item: PriceDateObject) => item.price),
                fill: false,
                borderColor: '#00C853',
                tension: 0.4
            }
        ]
    };
  }

  subscribeObservables() {
    this.kryptoService.currentKrypto$.pipe(takeUntil(this.destroyed$)).subscribe( currentKrypto => {
      this.currentKrypto = currentKrypto;
    });
  }


  async fillBTCcoinGecko() {
    let url = this.url_coin_gecko;
    let response = await firstValueFrom(this.http.get<any>(url));
    let price = response.market_data.current_price.eur;
    this.btc_coin_gecko = price;
  }


  async fillBTCPricesLast30Days(): Promise<PriceDateObject[]> {
    const baseUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart';
    const vsCurrency = 'eur';
    const days = 365;
    const url = `${baseUrl}?vs_currency=${vsCurrency}&days=${days}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const seenDates = new Set<string>();
      const pricesLast30Days: PriceDateObject[] = data.prices.filter(([timestamp]: [number, number]) => {
        const date = new Date(timestamp).toISOString().split('T')[0];
        if (seenDates.has(date)) {
          return false;
        }
        seenDates.add(date);
        return true;
      }).map(([timestamp, price]: [number, number]): PriceDateObject => ({
        price: price.toFixed(2),
        date: new Date(timestamp).toISOString().split('T')[0].replace(/-/g, '/')
      }));
      console.log(pricesLast30Days);
      this.course = pricesLast30Days;
      return pricesLast30Days;
    } catch (error) {
      console.error('Error fetching data from CoinGecko:', error);
      return [];
    }
  }



  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
