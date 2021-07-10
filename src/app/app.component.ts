import { utf8Encode } from '@angular/compiler/src/util';
import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ING-parser-excel';
  public inputFileString: string = '';
  public rows :string[] = [''];
  
  getINGfile(file : any){
    this.fileToString(file);
  }


  fileToString(file:any){
    const reader = new FileReader();
    const tempfile = file.target.files[0];
    reader.readAsText(tempfile);
    reader.onload = (e) => {
      const result = reader.result;
      this.inputFileString = result as string;
      this.rows = this.inputFileString.split('\n')
    }
  }



}
