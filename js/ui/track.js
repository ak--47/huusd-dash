// Anonymous usage analytics: Mixpanel events and session replay, loaded through a proxy so ad
// blockers do not drop them. Nobody is identified. Off on localhost, where a stub keeps every call
// in window.__mpEvents for the browser checks.

const TOKEN = "0695defd4c9fb470c8c838dc4c72f24c"; // public project token, meant for browser code
const PROXY = "https://express-proxy-lmozz6xkha-uc.a.run.app";

const LOCAL = ["localhost", "127.0.0.1", ""].includes(location.hostname);

let page = "start";

function stub() {
  const events = (window.__mpEvents = window.__mpEvents ?? []);
  const keep = (name) => (...args) => events.push([name, ...args]);
  window.mixpanel = {
    init() {},
    track: keep("track"),
    track_pageview: keep("track_pageview"),
    register: keep("register"),
    opt_out_tracking() {},
    stop_session_recording() {},
  };
}

// The official Mixpanel loader snippet, pointed at the proxy's copy of the library.
function loadMixpanel() {
  (function (f, b) {
    if (b.__SV) return;
    window.mixpanel = b;
    b._i = [];
    b.init = function (e, fn, c) {
      function g(a, d) {
        const parts = d.split(".");
        if (parts.length === 2) {
          a = a[parts[0]];
          d = parts[1];
        }
        a[d] = function () {
          a.push([d].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }
      let a = b;
      if (typeof c !== "undefined") a = b[c] = [];
      else c = "mixpanel";
      a.people = a.people || [];
      a.toString = (x) => `mixpanel${c !== "mixpanel" ? `.${c}` : ""}${x ? "" : " (stub)"}`;
      a.people.toString = () => `${a.toString(1)}.people (stub)`;
      const methods =
        "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
          " "
        );
      for (const m of methods) g(a, m);
      b._i.push([e, fn, c]);
    };
    b.__SV = 1.2;
    const s = f.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = `${PROXY}/lib.min.js`;
    const first = f.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(s, first);
  })(document, window.mixpanel || []);

  window.mixpanel.init(TOKEN, {
    api_host: PROXY,
    persistence: "localStorage",
    ignore_dnt: true,
    batch_flush_interval_ms: 0,
    api_transport: "XHR",
    api_payload_format: "json",
    recorder_src: `${PROXY}/libs/mixpanel-recorder.min.js`,
    // every click, input change, scroll, and rage or dead click; page views are sent by the router
    autocapture: { pageview: false, click: true, dead_click: true, rage_click: true, input: true, scroll: true, submit: true, capture_text_content: true },
    // session replay for every visit; the site collects nothing personal, so text is not masked
    record_sessions_percent: 100,
    record_mask_text_selector: "nope",
    record_block_selector: "nope",
    record_block_class: "mp-no-record",
    record_mask_all_inputs: false,
    record_inline_images: true,
    record_canvas: false,
    record_collect_fonts: true,
    record_heatmap_data: true,
    loaded(mp) {
      mp.register({ site: "harwood-school-plans", $mp_user_agent: navigator.userAgent });
    },
  });
}

if (LOCAL) stub();
else loadMixpanel();

/** Send an event with the current page attached. Never throws, never sends personal data. options goes
 * to mixpanel.track (e.g. { send_immediately: true }). */
export function track(event, props = {}, options) {
  try {
    window.mixpanel?.track?.(event, { page, ...props }, ...(options ? [options] : []));
  } catch {
    // analytics must never break the page
  }
}

/** The router calls this after each page renders. */
export function pageview(path, params) {
  page = path || "start";
  try {
    window.mixpanel?.register?.({ page });
    const at = params?.get?.("at");
    window.mixpanel?.track_pageview?.({ page, ...(at ? { section: at } : {}) });
  } catch {
    // ignore
  }
}
