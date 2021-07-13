import { Component } from '@angular/core';
import { INGmutation, INGparserService } from './services/ingparser.service';
import { filter } from 'rxjs/operators';

//https://www.ing.nl/media/266197_1216_tcm162-117728.pdf

interface Year {
  months?: Number[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ING-parser-excel';
  public mutations: INGmutation[] = [];
  public totalMonny: number = 0;
  public availableDates: Year[] = [];

  constructor(private INGparser: INGparserService) {
    INGparser.$INGmutations
      .pipe(filter((mutations) => mutations.length !== 0))
      .subscribe((mutations) => {
        mutations.map((mutation) => {
          if (mutation.afBij === false) {
            this.totalMonny -= mutation.bedrag;
          } else {
            this.totalMonny += mutation.bedrag;
          }
          return;
        });
        this.mutations = mutations;
      });
  }

  async getINGfile(file: any) {
    await this.INGparser.loadInFile(file);
  }

  getMonts() {
    let availableMontsinYear: number[][] = [];

    let tempMonth: number;
    let tempYear: number;
    let tempYearold: number;
    let YearIndex: number = 0;

    this.mutations.forEach((mutation, index) => {
      //for each mutation check the date and get the months
      //first run cthe tempyearold === tempyear to detect change there
      if (index === 0) {
        tempMonth = mutation.datum.getMonth();
        const tempYear = mutation.datum.getFullYear();
        const tempYearold = tempYear;
        console.log(tempYear);
        availableMontsinYear.push([]);
      } else {
        if (tempYear !== tempYearold) {
          YearIndex++;
          availableMontsinYear.push([tempYear], []);
        }

        if (availableMontsinYear[YearIndex]?.includes(tempMonth)) {
          //nothing
        } else {
          availableMontsinYear[YearIndex].push(tempMonth);
        }
      }

      tempYearold = tempYear;
    });
    console.log(availableMontsinYear);
  }
}
