import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit {

  data: any;
  backgroundColor: string;

  onSelect: Function;
  onDelete: Function;

  constructor() { }

  ngOnInit(): void {
    switch (this.data["color"]) {
      case 0: {
        this.backgroundColor = "blue";
        break;
      }
      case 1: {
        this.backgroundColor = "green";
        break;
      }
      case 2: {
        this.backgroundColor = "orange";
        break;
      }
      case 3: {
        this.backgroundColor = "lavender";
        break;
      }
    }
  }

}
