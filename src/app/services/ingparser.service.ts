import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface INGmutation {
  datum: Date;
  omschrijving: String;
  rekening: String;
  tegenRekening: String;
  code: Codes;
  afBij: boolean; // true == bij, false == af
  bedrag: number;
  mutatiesoort: string;
  mededeling: string;
  saldoNa: number;
  tag: string;
}

enum INGtypes {
  datum = 0,
  omschrijving,
  rekening,
  tegenRekening,
  code,
  afBij,
  bedrag,
  mutatiesoort,
  mededeling,
  saldoNa,
  tag,
}

enum Codes {
  AC, // Acceptgiro
  BA, // Betaalautomaat
  DV, // Diversen
  FL, // Filiaalboeking
  GF, // Telefonisch bankieren
  GM, // Geldautomaat
  GT, // Internetbankieren
  IC, // Incasso
  OV, // Overschrijving
  PK, // Opname kantoor
  PO, // Periodieke overschrijving
  ST, // Storting
  VZ, // Verzamelbetaling
}

@Injectable({
  providedIn: 'root',
})
export class INGparserService {
  rawArrayFromCsb: string[][] = [[]];
  mutationsList: INGmutation[] = [];

  private INGmutations = new BehaviorSubject<INGmutation[]>([]);
  public $INGmutations: Observable<INGmutation[]>;

  constructor() {
    this.$INGmutations = this.INGmutations.asObservable();
  }

  emptyIngMutation = (): INGmutation => ({
    omschrijving: '',
    afBij: true,
    rekening: '',
    tegenRekening: '',
    tag: '',
    code: Codes.VZ,
    datum: new Date('0'),
    saldoNa: 0,
    bedrag: 0,
    mutatiesoort: '',
    mededeling: '',
  });

  //use this to load the file and feed the service,
  //if you dont do load a file this service wont do anything
  // @return true if it went well.
  async loadInFile(file: any): Promise<boolean> {
    try {
      let rawString: string = '';
      rawString = await this.readFile(file);
      this.rawArrayFromCsb = this.CSVStringToArray(rawString);
      this.csvToINGtype(this.rawArrayFromCsb);

      return true;
    } catch (e) {
      throw Error(e);
    }
  }

  private readFile(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const tempfile = file.target.files[0];
      reader.readAsText(tempfile);
      reader.onload = (e) => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
    });
  }

  // "inside of string"
  // ; next entry
  // space = next row

  CSVStringToArray(string: string): string[][] {
    let startOfString: Boolean = false;
    let col = 0;
    let row = 0;
    let wordlen = 0;

    let dataArray: string[][] = [];
    let rowArray: string[] = [];

    for (let len = 0; len <= string.length; len++) {
      switch (string[len]) {
        case '"': // start or end of string
          startOfString = !startOfString; //toggle
          if (startOfString === false) {
            if (wordlen > 0) {
              rowArray.push(string.substring(len + 1 - wordlen, len));
            }
            wordlen = 0;
          }
          break;
        case ';': // next col
          col++;
          break;
        case '\n': // if not in string then new row
          if (startOfString) {
            break;
          }
          row++;
          dataArray.push(rowArray);
          rowArray = [];
          break;
      }

      if (startOfString) {
        wordlen++;
      }
    }
    return dataArray;
  }

  //convert the raw 2d array to the INGmutation definition
  csvToINGtype(rawMutations: string[][]) {
    rawMutations.forEach((mutation) => {
      this.mutationsList.push(this.emptyIngMutation());
    });

    rawMutations.forEach((mutation, index) => {
      if (index === 0) return; // first line is the header
      mutation.forEach((field, i) => {
        switch (i) {
          case INGtypes.datum:
            let year = field.substring(0, 4);
            let month = field.substring(4, 6);
            let day = field.substring(6, 8);
            this.mutationsList[index - 1].datum = new Date(
              +year,
              +month - 1, // date time month is from 0 to 11
              +day
            );
            break;
          case INGtypes.omschrijving:
            this.mutationsList[index - 1].omschrijving = field;
            break;
          case INGtypes.rekening:
            this.mutationsList[index - 1].rekening = field;
            break;
          case INGtypes.tegenRekening:
            this.mutationsList[index - 1].tegenRekening = field;
            break;
          case INGtypes.code:
            this.mutationsList[index - 1].code = field as unknown as Codes;
            break;
          case INGtypes.afBij:
            if (field === 'Af') {
              this.mutationsList[index - 1].afBij = false;
            } else if (field === 'Bij') {
              this.mutationsList[index - 1].afBij = true;
              console.log(this.mutationsList[index - 1].afBij);
            }

            break;
          case INGtypes.bedrag:
            this.mutationsList[index - 1].bedrag = +field.replace(',', '.');
            break;
          case INGtypes.mutatiesoort:
            this.mutationsList[index - 1].mutatiesoort = field;
            break;
          case INGtypes.mededeling:
            this.mutationsList[index - 1].mededeling = field;
            break;
          case INGtypes.saldoNa:
            this.mutationsList[index - 1].saldoNa = +field.replace(',', '.');
            break;
          case INGtypes.tag:
            this.mutationsList[index - 1].tag = field;
            break;
        }
      });
    });

    this.INGmutations.next([...this.mutationsList] as INGmutation[]);
  }
}
