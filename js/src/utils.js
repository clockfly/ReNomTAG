var API_SERVER = '' // process.env.api_server || "";

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
