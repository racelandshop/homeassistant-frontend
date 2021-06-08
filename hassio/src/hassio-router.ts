import { customElement, property } from "lit/decorators";
import { navigate } from "../../src/common/navigate";
import { HassioPanelInfo } from "../../src/data/hassio/supervisor";
import { Supervisor } from "../../src/data/supervisor/supervisor";
import {
  HassRouterPage,
  RouterOptions,
} from "../../src/layouts/hass-router-page";
import "../../src/resources/ha-style";
import { HomeAssistant } from "../../src/types";
// Don't codesplit it, that way the dashboard always loads fast.
import "./hassio-panel";

@customElement("hassio-router")
class HassioRouter extends HassRouterPage {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public panel!: HassioPanelInfo;

  @property({ type: Boolean }) public narrow!: boolean;

  protected routerOptions: RouterOptions = {
    // Hass.io has a page with tabs, so we route all non-matching routes to it.
    defaultPage: "dashboard",
    initialLoad: () => this._redirects(),
    showLoading: true,
    routes: {
      dashboard: {
        tag: "hassio-panel",
        cache: true,
      },
      snapshots: "dashboard",
      backups: "dashboard",
      store: "dashboard",
      system: "dashboard",
      addon: {
        tag: "hassio-addon-dashboard",
        load: () => import("./addon-view/hassio-addon-dashboard"),
      },
      ingress: {
        tag: "hassio-ingress-view",
        load: () => import("./ingress-view/hassio-ingress-view"),
      },
      _my_redirect: {
        tag: "hassio-my-redirect",
        load: () => import("./hassio-my-redirect"),
      },
    },
  };

  protected updatePageEl(el) {
    // the tabs page does its own routing so needs full route.
    const hassioPanel = el.nodeName === "HASSIO-PANEL";
    const route = hassioPanel ? this.route : this.routeTail;

    if (hassioPanel && this.panel.config?.ingress) {
      this._redirects();
      return;
    }

    el.hass = this.hass;
    el.narrow = this.narrow;
    el.route = route;
    el.supervisor = this.supervisor;

    if (el.localName === "hassio-ingress-view") {
      el.ingressPanel = this.panel.config && this.panel.config.ingress;
    }
  }

  private async _redirects() {
    if (this.panel.config && this.panel.config.ingress) {
      this.route = {
        prefix: "/hassio",
        path: `/ingress/${this.panel.config.ingress}`,
      };
    } else if (this.route?.path === "/snapshots") {
      navigate("/hassio/backups", { replace: true });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hassio-router": HassioRouter;
  }
}
