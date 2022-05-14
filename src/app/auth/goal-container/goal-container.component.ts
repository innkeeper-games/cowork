import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { goals } from '../goals/goals'


@Component({
  selector: 'app-goal-container',
  templateUrl: './goal-container.component.html',
  styleUrls: ['./goal-container.component.css']
})
export class GoalContainerComponent implements OnInit {

  location: Location;

  constructor(location: Location) {
    this.location = location;
  }

  ngOnInit(): void {
    if (this.location.path() == '/auth') {
      this.location.replaceState('/auth/sign-in');
    }
    this.updateGoal(this.location.path(), this.location.getState());
    this.location.onUrlChange(this.updateGoal);
  }

  onMsgReceived(msg: Map<string, string>): void {
    if (msg.has("error")) {
      console.log(msg["error"]);
    }
  }

  updateGoal(url: string, state: unknown): void {
    let goal: string = "";
    if (url.includes('/auth')) {
      goal = url.replace('/auth', '');
      goal = goal.replace('/', '');
      if (goal.split('/').length > 1) {
        goal = goal.split('/')[0];
      }
    }
    else {
      goal = "join-room";
    }
    let visibleGoals: HTMLCollection = document.getElementsByClassName("visible");
    let i: number = 0;
    for (let i: number = 0; i < visibleGoals.length; i++) {
      let visibleGoal: Element = document.getElementsByClassName("visible")[i];
      visibleGoal.classList.remove("visible");
    }
    if (goals.includes(goal)) {
      let newVisibleGoal: Element = document.getElementById(goal);
      newVisibleGoal.classList.add("visible");
    }
  }

}
