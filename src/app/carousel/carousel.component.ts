import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { KryptoService } from '../services/krypto.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent {

  kryptos!: any;

  private destroyed$ = new Subject<void>();


  constructor(private kryptoService: KryptoService) {}


  ngOnInit() {
    this.subscribeObservables();
  }

  subscribeObservables() {
    this.kryptoService.kryptos$.pipe(takeUntil(this.destroyed$)).subscribe( kryptos => {
      this.kryptos = kryptos;
    });
  }

  onCarouselPageChange(event: any) {
    const currentKrypto = this.kryptos[event.page];
    this.setNewKrypto(currentKrypto.short, currentKrypto.name);
  }


  setNewKrypto(newKrypto: string, newKryptoName: string) {
    this.kryptoService.setCurrentCrypto(newKrypto, newKryptoName);
  }



  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
