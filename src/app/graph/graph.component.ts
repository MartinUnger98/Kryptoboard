import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { KryptoService } from '../services/krypto.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {
  private destroyed$ = new Subject<void>();
  startDate: string = "2021-07-01";
  months!: string[];
  course: any = [];
  currentKrypto!: string;
  data: any;

  API_KEY: string = "YVMV5XW08E170GLV";

  constructor(private kryptoService: KryptoService, private http: HttpClient) {}

  async ngOnInit() {
    this.subscribeObservables();
    this.months = this.generateMonthsLastDay(this.startDate);
    await this.loadMonthlyCourse();
  }


  async loadMonthlyCourse() {
    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_MONTHLY&symbol=${this.currentKrypto}&market=EUR&apikey=${this.API_KEY}`;
    const response = await firstValueFrom(this.http.get<any>(url));
    const monthlyCourse = response["Time Series (Digital Currency Monthly)"];
    this.course = this.months.map(month => {
      const data = monthlyCourse[month];
      return data ? data["1a. open (EUR)"] : null;
    });
    this.setupChart(this.months);
  }


  async loadDailyCourse(startDate: string, endDate: string) {
    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${this.currentKrypto}&market=EUR&apikey=${this.API_KEY}`;
    const response = await firstValueFrom(this.http.get<any>(url));
    const dailyCourseData = response["Time Series (Digital Currency Daily)"];

    let filteredDailyCourse = [];

    const dates = Object.keys(dailyCourseData).filter(date => date >= startDate && date <= endDate);

    for (const date of dates) {
      const dataForDate = dailyCourseData[date];
      filteredDailyCourse.push({
        date: date,
        open: parseFloat(dataForDate["1a. open (EUR)"])
      });
    }

    let courseDays = [];
    let courseValues = [];

    for (let i = 0; i < filteredDailyCourse.length; i++) {
      courseDays.push(filteredDailyCourse[i].date);
      courseValues.push(filteredDailyCourse[i].open);
    }
    this.course = courseValues;
    this.setupChart(courseDays);
  }


  setupChart(labels:any) {
    this.data = {
        labels: labels.map((label: string) => label), // Extrahiert das Jahr und den Monat
        datasets: [
            {
                label: `${this.currentKrypto} zu EUR`,
                data: this.course,
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


  generateMonthsLastDay(startDate: string): string[] {
    const start = new Date(startDate);
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const months = [];

    while (start <= end) {
      start.setMonth(start.getMonth() + 1, 1);
      start.setDate(start.getDate() - 1);

      if (start <= end) {
        months.push(start.toISOString().split('T')[0]);
      }
      start.setDate(start.getDate() + 1);
    }
    return months;
  }


  get apiUrl() {
    return `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${this.currentKrypto}&to_currency=EUR&apikey=${this.API_KEY}`;
  }


  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
