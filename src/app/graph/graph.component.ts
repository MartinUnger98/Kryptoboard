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
  API_KEY: string = "CG-QNdDAkMhcmfZMRXThWCkqhGc";

  currentKrypto!: string;
  currentKryptoName!: string;

  data: any;
  course: any = [];

  attribute_API_KEY: string = `?x_cg_demo_api_key=${this.API_KEY}`;
  base_url: string = `https://api.coingecko.com/api/v3/coins/`;
  standard_currency: string = 'eur';
  course_days: number = 30;

  current_price!: number;
  current_url!: string;


  apiCounter: number = 0;
  actualTime:  Date = new Date();
  timeToNextMinute = (60 - this.actualTime.getSeconds()) * 1000 - this.actualTime.getMilliseconds();

  constructor(private kryptoService: KryptoService, private http: HttpClient) {}




  async ngOnInit() {
    this.subscribeObservables();
    this.resetVariableOnNewMinute();
  }


  resetVariable() {
    this.apiCounter = 0;
    console.log(this.apiCounter);
  }


  resetVariableOnNewMinute() {
    setTimeout(() => {
      this.resetVariable();
      setInterval(() => this.resetVariable(), 60000);
    }, this.timeToNextMinute);
  }


  subscribeObservables() {
    this.kryptoService.currentKrypto$.pipe(takeUntil(this.destroyed$)).subscribe( currentKrypto => {
      this.currentKrypto = currentKrypto;
    });

    this.kryptoService.currentKryptoName$.pipe(takeUntil(this.destroyed$)).subscribe( currentKryptoName => {
      this.currentKryptoName = currentKryptoName;
      this.updateCurrentURL();
      this.updateKryptoData();
    });

  }


  updateCurrentURL() {
    this.current_url = `https://api.coingecko.com/api/v3/coins/${this.currentKryptoName}` + this.attribute_API_KEY;
  }


  async updateKryptoData() {
    await this.setCurrentPrice();
    await this.setDataForChart();
    this.setupChart();
  }


  async setCurrentPrice() {
    let response = await firstValueFrom(this.http.get<any>(this.current_url));
    let price = response.market_data.current_price.eur;
    this.current_price = price;
  }


  async setDataForChart(): Promise<PriceDateObject[]> {
    const url = this.buildUrl();
    try {
      const data = await this.fetchData(url);
      const pricesLast30Days = this.transformChartData(data);
      this.course = pricesLast30Days;
      return pricesLast30Days;
    } catch (error) {
      //here show  error message or something like that
      console.error('Error fetching data from CoinGecko:', error);
      return [];
    }
  }

  buildUrl(): string {
    return `${this.base_url}/${this.currentKryptoName}/market_chart?vs_currency=${this.standard_currency}&days=${this.course_days}${this.attribute_API_KEY}`;
  }

  async fetchData(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }

  transformChartData(data: any): PriceDateObject[] {
    const seenDates = new Set<string>();
    return data.prices.filter(([timestamp]: [number, number]) => {
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


  async changeDays(days: number) {
    this.course_days = days;
    await this.setDataForChart();
    this.setupChart();
  }



  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
