import { NgModule } from '@angular/core';
import { PreloadAllModules, Router, RouterModule, Routes } from '@angular/router';

import { MobStorefrontComponent } from './mob-storefront/mob-storefront.component';
import { DeskStorefrontComponent } from './desk-storefront/desk-storefront.component';
import { MobCartComponent } from './mob-cart/mob-cart.component';
import { DeskCartComponent } from './desk-cart/desk-cart.component';
import { DeskOrderComponent } from './desk-order/desk-order.component';
import { MobOrderComponent } from './mob-order/mob-order.component';
import { ApplicationStateService } from './application-state.service';
import { DeskPortalComponent } from './desk-portal/desk-portal.component';


const desktop_routes: Routes = [
  {path: 'portal', component: DeskPortalComponent},

  {path: 'shop', component: DeskStorefrontComponent},
  {path: 'cart', component: DeskCartComponent},
  {path: 'order', component: DeskOrderComponent},
  {path: '**', redirectTo: 'portal'}
];

const mobile_routes: Routes = [
  // {path: 'portal', component: MobPortalComponent},

  {path: 'shop', component: MobStorefrontComponent},
  {path: 'cart', component: MobCartComponent},
  {path: 'order', component: MobOrderComponent},
  {path: '**', redirectTo: 'shop'}
];

@NgModule({
  // as default we set the desktop routing configuration. if mobile will be started it will be replaced below.
  // note that we must specify some routes here (not an empty array) otherwise the trick below doesn't work...
  imports: [RouterModule.forRoot(desktop_routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {

  public constructor(private router: Router,
    private applicationStateService: ApplicationStateService) {

    if (applicationStateService.getIsMobileResolution()) {
      router.resetConfig(mobile_routes);
    }
  }

  /**
   * this function inject new routes for the given module instead the current routes. the operation happens on the given current routes object so after
   * this method a call to reset routes on router should be called with the the current routes object.
   * @param currentRoutes
   * @param routesToInject
   * @param childNameToReplaceRoutesUnder - the module name to replace its routes.
   */
  private injectModuleRoutes(currentRoutes: Routes, routesToInject: Routes, childNameToReplaceRoutesUnder: string): void {
    for (let i = 0; i < currentRoutes.length; i++) {
      if (currentRoutes[i].loadChildren != null &&
        currentRoutes[i].loadChildren.toString().indexOf(childNameToReplaceRoutesUnder) != -1) {
        // we found it. taking the route prefix
        let prefixRoute: string = currentRoutes[i].path;
        // first removing the module line
        currentRoutes.splice(i, 1);
        // now injecting the new routes
        // we need to add the prefix route first
        this.addPrefixToRoutes(routesToInject, prefixRoute);
        for (let route of routesToInject) {
          currentRoutes.push(route);
        }
        // since we found it we can break the injection
        return;
      }

      if (currentRoutes[i].children != null) {
        this.injectModuleRoutes(currentRoutes[i].children, routesToInject, childNameToReplaceRoutesUnder);
      }
    }
  }

  private addPrefixToRoutes(routes: Routes, prefix: string) {
    for (let i = 0; i < routes.length; i++) {
      routes[i].path = prefix + '/' + routes[i].path;
    }
  }
}
