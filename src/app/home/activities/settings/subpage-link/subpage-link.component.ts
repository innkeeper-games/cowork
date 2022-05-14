import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-subpage-link',
  templateUrl: './subpage-link.component.html',
  styleUrls: ['./subpage-link.component.css']
})
export class SubpageLinkComponent implements OnInit {

  @Input() title: string;
  @Input() subpage: string;
  @Input() open: Function;

  constructor() { }

  ngOnInit(): void {
  }

}
