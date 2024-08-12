import {
  Component,
  HostListener,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { TextboxComponent } from '../textbox/textbox.component';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TextboxComponent, CommonModule, TopBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  globalTabCount = 1;
  tabs: { tabName: string; value: string }[] = [
    {
      tabName: 'new_1',
      value: '',
    },
  ];
  currentSelectedIndex = 0;

  @ViewChildren(TextboxComponent)
  textBoxComponents!: QueryList<TextboxComponent>;

  // todo
  // Ensure when forgot password and resetting, new password must contain special char (same restraints)
  // Ensure only one email per account, create forgot password/reset password + forgot username functionality
  // Delete account functionality
  // improve verification email html/css layout
  // proper error response during register page when clicking sign up but user name exists
  // modify selected text color everywhere
  // login after email verification, ability to forget/change password w/ email
  // Login page/semi-secure login functionality
  // Multiple accounts/users on same device will get notes messed up due to local storage key names
  // Drag to rearrange/move tabs
  // Add remaining character counter to textboxes?
  // allow adjustment of font size
  // allow adjust font color
  // Custom scroll bar!
  // Loading spinners/animation (when logging in, registering)
  // Improve confirm popups for delete tab and rename tabs, logout
  // Handle no internet/response with backend situations (backend totally down), login etc
  // make textarea proper size, large
  // allow adjust background color, user can upload pic, or fun moving graphics/vids
  // implement save single file button
  // Sweet font, ability to underline, make bold etc, add bullets
  // make dirty/unsaved files have different tab color
  // Save button? Save entries to local storage and backend?
  // Option to rename tabs
  // Multiple tabs/textareas, flip through tabs
  // Add collaborative option, like google drive, multiple users can real time edit
  // Create limit for text in textbox to prevent spammers

  ngOnInit() {
    const history = localStorage.getItem('notepad-history');
    const currentIdx = localStorage.getItem('notepad-current-index');
    const globalTabCount = localStorage.getItem('notepad-globalTabCount');
    if (history) {
      this.tabs = JSON.parse(history);
    }
    if (currentIdx) {
      this.currentSelectedIndex = JSON.parse(currentIdx);
    }
    if (globalTabCount) {
      this.globalTabCount = JSON.parse(globalTabCount);
    }
  }

  @HostListener('dblclick', ['$event'])
  changeTabName(e: KeyboardEvent) {
    const idx = (e.target as HTMLInputElement).value;
    if ((e.target as HTMLInputElement).classList.contains('current-tab')) {
      let res = prompt('Rename tab');
      if (res) {
        this.tabs[parseInt(idx)].tabName = res;
        this.saveFile();
      }
    }
  }

  newTab() {
    let tabLimit = 20;
    if (this.tabs.length <= tabLimit) {
      if (this.globalTabCount >= 99) {
        this.globalTabCount = 0;
      }
      this.tabs.push({ tabName: `new_${++this.globalTabCount}`, value: '' });
    } else {
      alert(`Tab limit of ${tabLimit} reached`);
    }
  }

  @HostListener('keyup', ['$event'])
  @HostListener('keydown', ['$event'])
  @HostListener('click', ['$event'])
  saveFile() {
    console.log(this.tabs);
    this.textBoxComponents.forEach((box) => {
      let obj = box.emitValueAndIndex();
      this.tabs[obj.index].value = obj.value;
    });
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem('notepad-history', JSON.stringify(this.tabs));
    localStorage.setItem(
      'notepad-current-index',
      JSON.stringify(this.currentSelectedIndex)
    );
    localStorage.setItem(
      'notepad-globalTabCount',
      JSON.stringify(this.globalTabCount)
    );
  }

  deleteTab(index: number, event: MouseEvent) {
    console.log('current selected: ' + this.currentSelectedIndex);
    console.log(index);
    if (
      this.tabs[index].value.length === 0 ||
      window.confirm(`Delete '${this.tabs[index].tabName}'?`)
    ) {
      this.tabs.splice(index, 1);
      console.log(this.tabs);
      if (index < this.currentSelectedIndex) {
        this.currentSelectedIndex -= 1;
      }
      this.saveToLocalStorage();
    }
    event.stopPropagation();
  }
}
