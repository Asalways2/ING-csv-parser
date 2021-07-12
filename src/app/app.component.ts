import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ING-parser-excel';
  public parsedfile: string[][] = [];
  public amountOfEntrys: number = 0;
  public rawFileString: string = '';

  async getINGfile(file: any) {
    this.rawFileString = await this.readFile(file);
    console.log(this.CSVStringToArray(this.rawFileString));
  }

  readFile(file: any): Promise<string> {
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

  CSVStringToArray(string: String): string[][] {
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
}
