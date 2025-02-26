import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";
import { Menubar } from "primeng/menubar";
import { Button } from "primeng/button";
import { Avatar } from "primeng/avatar";
import { Menu } from "primeng/menu";
import { Dialog } from "primeng/dialog";
import { RouterLink } from "@angular/router";
import { LOGGEDIN_USER_KEY } from "../../constants/cookie.constant";
import { Observable } from "rxjs";
import { UserService } from "../../services/user.service";
import { CookieService } from "ngx-cookie-service";
import { User } from "../../interfaces/user.interface";

@Component({
  selector: "app-header",
  imports: [CommonModule, Avatar, Menu, Menubar, Button, Dialog, RouterLink],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit {
  appMenuItems: MenuItem[] = [];
  isLoggedIn$: Observable<boolean>;
  loggedInUser$: Observable<User>;
  qrCodeImagegLink: string = "";
  isQRCodeDialogVisible: boolean = false;
  username: string = "";
  userMenuItems: MenuItem[] = [];
  constructor(
    private cookieService: CookieService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.appMenuItems = [
      {
        label: "Home",
        icon: "pi pi-home",
        routerLink: "/",
      },
    ];

    this.userMenuItems = [
      {
        label: "Settings",
        icon: "pi pi-cog",
        routerLink: "/settings",
      },
      {
        label: "Get QR Code",
        icon: "pi pi-qrcode",
        command: () => this.getQrCode(),
      },
      {
        label: "Log Out",
        icon: "pi pi-sign-out",
        command: () => this.logOut(),
      },
    ];

    this.loggedInUser$ = this.userService.loggedInUser$.asObservable();
    const userCookie = this.cookieService.get(LOGGEDIN_USER_KEY);
    if (userCookie) {
      const user = JSON.parse(userCookie);
      if (user) {
        this.userService.loggedInUser$.next(user);
      }
    }
  }

  getQrCode() {
    this.isQRCodeDialogVisible =true;
    this.userService.getQrCode().subscribe((response) => {
      this.qrCodeImagegLink = "data:image/png;base64," + response["data"];
    });
  }

  logOut() {
    this.cookieService.delete(LOGGEDIN_USER_KEY);
    this.userService.loggedInUser$.next(null);
  }

  convertBytesToImage(byteArray: Uint8Array) {
    const blob = new Blob([byteArray], { type: "image/png" });

    return URL.createObjectURL(blob);
  }
}
