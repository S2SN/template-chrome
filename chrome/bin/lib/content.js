// [Template](http://neocotic.com/template)
// (c) 2013 Alasdair Mercer
// Freely distributable under the MIT license.
// For all details and documentation:
// <http://neocotic.com/template>
(function() {
  var elementBackups, elements, extractAll, getContent, getLink, getMeta, hotkeys, isEditable, isThisPlatform, parentLink, paste, runSelector, runXPath, xpath,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  elementBackups = {};

  elements = {
    field: null,
    link: null,
    other: null
  };

  hotkeys = [];

  extractAll = function(array, property) {
    var element, results, _i, _len, _ref;

    results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element[property] != null) {
        if (_ref = element[property], __indexOf.call(results, _ref) < 0) {
          results.push(element[property]);
        }
      }
    }
    return results;
  };

  getContent = function(node, output) {
    if (!node) {
      return '';
    }
    if (output === 'html' || output === 'markdown') {
      return node.innerHTML;
    } else {
      return node.textContent;
    }
  };

  getLink = function(id, url) {
    var _ref;

    if (elementBackups[id] == null) {
      return;
    }
    if (((_ref = elementBackups[id].link) != null ? _ref.href : void 0) === url) {
      return elementBackups[id].link;
    } else {
      return parentLink(elementBackups[id].other);
    }
  };

  getMeta = function(name, csv) {
    var content, results, value, _i, _len, _ref, _ref1, _ref2;

    content = (_ref = document.querySelector("meta[name='" + name + "']")) != null ? (_ref1 = _ref.content) != null ? _ref1.trim() : void 0 : void 0;
    if (csv && (content != null)) {
      results = [];
      _ref2 = content.split(/\s*,\s*/);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        value = _ref2[_i];
        if (value.length) {
          if (__indexOf.call(results, value) < 0) {
            results.push(value);
          }
        }
      }
      return results;
    } else {
      return content;
    }
  };

  isEditable = function(node) {
    return (node != null) && !node.disabled && !node.readOnly;
  };

  isThisPlatform = function(os) {
    return RegExp("" + os, "i").test(navigator.platform);
  };

  parentLink = function(node) {
    if (node == null) {
      return;
    }
    if (node.nodeName === 'A') {
      return node;
    } else {
      return parentLink(node.parentNode);
    }
  };

  paste = function(node, value) {
    var str;

    if (!((node != null) || value)) {
      return;
    }
    str = node.value.substr(0, node.selectionStart);
    str += value;
    str += node.value.substr(node.selectionEnd, node.value.length);
    return node.value = str;
  };

  runSelector = function(info) {
    var all, convertTo, e, expression, node, nodes;

    all = info.all, convertTo = info.convertTo, expression = info.expression;
    try {
      return info.result = all ? (nodes = document.querySelectorAll(expression), (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          node = nodes[_i];
          if (node) {
            _results.push(getContent(node, convertTo));
          }
        }
        return _results;
      })()) : (node = document.querySelector(expression), node ? getContent(node, convertTo) : void 0);
    } catch (_error) {
      e = _error;
      return info.error = e;
    }
  };

  runXPath = function(info) {
    var all, contents, convertTo, e, expression, i, node, result;

    all = info.all, convertTo = info.convertTo, expression = info.expression;
    try {
      return info.result = (function() {
        var _i, _ref;

        if (all) {
          result = xpath(expression, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
          contents = [];
          for (i = _i = 0, _ref = result.snapshotLength; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            node = result.snapshotItem(i);
            if (node) {
              contents.push(getContent(node, convertTo));
            }
          }
          return contents;
        } else {
          result = xpath(expression, XPathResult.FIRST_ORDERED_NODE_TYPE);
          node = result.singleNodeValue;
          if (node) {
            return getContent(node, convertTo);
          }
        }
      })();
    } catch (_error) {
      e = _error;
      return info.error = e;
    }
  };

  xpath = function(expression, type) {
    return document.evaluate(expression, document, null, type, null);
  };

  chrome.extension.sendMessage({
    type: 'info'
  }, function(data) {
    var isMac;

    hotkeys = data.hotkeys;
    isMac = isThisPlatform('mac');
    if (document.body.getAttribute(data.id) === data.version) {
      return;
    }
    document.body.setAttribute(data.id, data.version);
    addEventListener('contextmenu', function(e) {
      switch (e.target.nodeName) {
        case 'A':
          return elements.link = e.target;
        case 'INPUT':
        case 'TEXTAREA':
          return elements.field = e.target;
        default:
          return elements.other = e.target;
      }
    });
    addEventListener('keydown', function(e) {
      var key, _ref;

      if ((!isMac && e.ctrlKey && e.altKey) || (isMac && e.shiftKey && e.altKey)) {
        key = String.fromCharCode(e.keyCode).toUpperCase();
        if (__indexOf.call(hotkeys, key) >= 0) {
          elements.field = (_ref = e.target.nodeName) === 'INPUT' || _ref === 'TEXTAREA' ? e.target : null;
          chrome.extension.sendMessage({
            data: {
              key: key
            },
            type: 'shortcut'
          });
          return e.preventDefault();
        }
      }
    });
    return chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
      var callback, container, contents, href, images, info, key, link, links, selection, src, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;

      callback = function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (typeof sendResponse === 'function') {
          sendResponse.apply(null, args);
          return true;
        }
      };
      if (message.hotkeys != null) {
        hotkeys = message.hotkeys;
        return callback();
      }
      if (message.expressions != null) {
        _ref = message.expressions;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          info = _ref[key];
          switch (info.type) {
            case 'select':
              runSelector(info);
              break;
            case 'xpath':
              runXPath(info);
          }
        }
        return callback({
          expressions: message.expressions
        });
      }
      if (message.id == null) {
        return callback();
      }
      if (message.type === 'paste') {
        if ((message.contents != null) && isEditable((_ref1 = elementBackups[message.id]) != null ? _ref1.field : void 0)) {
          paste(elementBackups[message.id].field, message.contents);
        }
        delete elementBackups[message.id];
        return callback();
      }
      elementBackups[message.id] = {
        field: message.editable || message.shortcut ? elements.field : void 0,
        link: message.link ? elements.link : void 0,
        other: message.link ? elements.other : void 0
      };
      selection = getSelection();
      if (!selection.isCollapsed) {
        contents = selection.getRangeAt(0).cloneContents();
        if (contents) {
          container = document.createElement('div');
          container.appendChild(contents);
          _ref2 = container.querySelectorAll('[href]');
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            href = _ref2[_i];
            href.href = href.href;
          }
          _ref3 = container.querySelectorAll('[src]');
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            src = _ref3[_j];
            src.src = src.src;
          }
          images = extractAll(container.querySelectorAll('img[src]'), 'src');
          links = extractAll(container.querySelectorAll('a[href]'), 'href');
        }
      }
      link = getLink(message.id, message.url);
      return callback({
        author: getMeta('author'),
        characterSet: document.characterSet,
        description: getMeta('description'),
        images: extractAll(document.images, 'src'),
        keywords: getMeta('keywords', true),
        lastModified: document.lastModified,
        linkHTML: link != null ? link.innerHTML : void 0,
        linkText: link != null ? link.textContent : void 0,
        links: extractAll(document.links, 'href'),
        pageHeight: innerHeight,
        pageWidth: innerWidth,
        referrer: document.referrer,
        scripts: extractAll(document.scripts, 'src'),
        selectedImages: images,
        selectedLinks: links,
        selection: selection.toString(),
        selectionHTML: container != null ? container.innerHTML : void 0,
        styleSheets: extractAll(document.styleSheets, 'href')
      });
    });
  });

}).call(this);
