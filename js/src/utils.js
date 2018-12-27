var API_SERVER = ""; // process.env.api_server || "";

export function build_api_url(path) {
  if (API_SERVER.length) {
    return API_SERVER + path;
  } else {
    return path;
  }
}

export function min(a, b) {
  return a < b ? a : b;
}

export function max(a, b) {
  return a > b ? a : b;
}

export function client_to_node(node, points) {
  const rc = node.getBoundingClientRect();
  const ret = [];
  for (let [x, y] of points) {
    ret.push([x - rc.left + node.scrollLeft, y - rc.top + node.scrollTop]);
  }
  return ret;
}

export function node_to_client(node, points) {
  const rc = node.getBoundingClientRect();
  const ret = [];
  for (let [x, y] of points) {
    ret.push([x + rc.left - node.scrollLeft, y + rc.top - node.scrollTop]);
  }
  return ret;
}

export function client_to_node_rect(node, rect) {
  const [l, t, r, b] = rect;
  let [[nl, nt], [nr, nb]] = client_to_node(node, [[l, t], [r, b]]);
  return [nl, nt, nr, nb];
}

export function normalize_rect(rect) {
  let [l, t, r, b] = rect;
  let ret = [min(l, r), min(t, b), max(l, r), max(t, b)];
  return ret;
}

export function pt_in_rect(rect, x, y) {
  const [l, t, r, b] = normalize_rect(rect);
  return x >= l && x < r && y >= t && y < b;
}

// https://stackoverflow.com/questions/3393686/
export function addEventListenerOnce(target, type, listener, useCapture) {
  function fn(event) {
    target.removeEventListener(type, fn, useCapture);
    listener(event);
  }
  target.addEventListener(type, fn, useCapture);
}

export function undef_filename_show(undef_filename_list) {
  let undef_message =
    "error\n\n The following filenames are unavailable, which could not be loaded:\n\n";
  let length = Math.min(3, undef_filename_list.length);

  for (let i = 0; i < length; i++) {
    undef_message = undef_message.concat(undef_filename_list[i]);
    if (i != length - 1) {
      undef_message = undef_message.concat(", \n");
    }
    if (length == 3 && i == length - 1) {
      undef_message = undef_message.concat("\netc...");
    }
  }
  return undef_message;
}

/* \
 |*|
 |*|  :: cookies.js ::
 |*|
 |*|  A complete cookies reader/writer framework with full unicode support.
 |*|
 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
 |*|
 |*|  Syntaxes:
 |*|
 |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|  * docCookies.getItem(name)
 |*|  * docCookies.removeItem(name[, path])
 |*|  * docCookies.hasItem(name)
 |*|  * docCookies.keys()
 |*|
 \ */

/* eslint-disable */

export const cookies = {
  getItem: function(sKey) {
    if (!sKey || !this.hasItem(sKey)) {
      return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },
  removeItem: function(sKey, sPath) {
    if (!sKey || !this.hasItem(sKey)) {
      return; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
  },
  hasItem: function(sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function() {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
    return aKeys;
  }
};
