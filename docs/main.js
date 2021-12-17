!(function (e) {
  var t = {};
  function n(a) {
    if (t[a]) return t[a].exports;
    var r = (t[a] = { i: a, l: !1, exports: {} });
    return e[a].call(r.exports, r, r.exports, n), (r.l = !0), r.exports;
  }
  (n.m = e),
    (n.c = t),
    (n.d = function (e, t, a) {
      n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: a });
    }),
    (n.r = function (e) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    (n.t = function (e, t) {
      if ((1 & t && (e = n(e)), 8 & t)) return e;
      if (4 & t && 'object' == typeof e && e && e.__esModule) return e;
      var a = Object.create(null);
      if (
        (n.r(a),
        Object.defineProperty(a, 'default', { enumerable: !0, value: e }),
        2 & t && 'string' != typeof e)
      )
        for (var r in e)
          n.d(
            a,
            r,
            function (t) {
              return e[t];
            }.bind(null, r),
          );
      return a;
    }),
    (n.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return n.d(t, 'a', t), t;
    }),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.p = ''),
    n((n.s = 10));
})([
  function (e, t) {
    var n;
    n = (function () {
      return this;
    })();
    try {
      n = n || new Function('return this')();
    } catch (e) {
      'object' == typeof window && (n = window);
    }
    e.exports = n;
  },
  function (e, t, n) {
    'use strict';
    (function (e, n) {
      /*!
       * Vue.js v2.6.12
       * (c) 2014-2020 Evan You
       * Released under the MIT License.
       */
      var a = Object.freeze({});
      function r(e) {
        return null == e;
      }
      function s(e) {
        return null != e;
      }
      function o(e) {
        return !0 === e;
      }
      function i(e) {
        return (
          'string' == typeof e ||
          'number' == typeof e ||
          'symbol' == typeof e ||
          'boolean' == typeof e
        );
      }
      function p(e) {
        return null !== e && 'object' == typeof e;
      }
      var u = Object.prototype.toString;
      function l(e) {
        return '[object Object]' === u.call(e);
      }
      function d(e) {
        return '[object RegExp]' === u.call(e);
      }
      function c(e) {
        var t = parseFloat(String(e));
        return t >= 0 && Math.floor(t) === t && isFinite(e);
      }
      function y(e) {
        return s(e) && 'function' == typeof e.then && 'function' == typeof e.catch;
      }
      function m(e) {
        return null == e
          ? ''
          : Array.isArray(e) || (l(e) && e.toString === u)
          ? JSON.stringify(e, null, 2)
          : String(e);
      }
      function f(e) {
        var t = parseFloat(e);
        return isNaN(t) ? e : t;
      }
      function h(e, t) {
        for (var n = Object.create(null), a = e.split(','), r = 0; r < a.length; r++) n[a[r]] = !0;
        return t
          ? function (e) {
              return n[e.toLowerCase()];
            }
          : function (e) {
              return n[e];
            };
      }
      var v = h('slot,component', !0),
        g = h('key,ref,slot,slot-scope,is');
      function T(e, t) {
        if (e.length) {
          var n = e.indexOf(t);
          if (n > -1) return e.splice(n, 1);
        }
      }
      var b = Object.prototype.hasOwnProperty;
      function w(e, t) {
        return b.call(e, t);
      }
      function k(e) {
        var t = Object.create(null);
        return function (n) {
          return t[n] || (t[n] = e(n));
        };
      }
      var A = /-(\w)/g,
        _ = k(function (e) {
          return e.replace(A, function (e, t) {
            return t ? t.toUpperCase() : '';
          });
        }),
        x = k(function (e) {
          return e.charAt(0).toUpperCase() + e.slice(1);
        }),
        O = /\B([A-Z])/g,
        S = k(function (e) {
          return e.replace(O, '-$1').toLowerCase();
        });
      var C = Function.prototype.bind
        ? function (e, t) {
            return e.bind(t);
          }
        : function (e, t) {
            function n(n) {
              var a = arguments.length;
              return a ? (a > 1 ? e.apply(t, arguments) : e.call(t, n)) : e.call(t);
            }
            return (n._length = e.length), n;
          };
      function B(e, t) {
        t = t || 0;
        for (var n = e.length - t, a = new Array(n); n--; ) a[n] = e[n + t];
        return a;
      }
      function M(e, t) {
        for (var n in t) e[n] = t[n];
        return e;
      }
      function $(e) {
        for (var t = {}, n = 0; n < e.length; n++) e[n] && M(t, e[n]);
        return t;
      }
      function P(e, t, n) {}
      var F = function (e, t, n) {
          return !1;
        },
        E = function (e) {
          return e;
        };
      function I(e, t) {
        if (e === t) return !0;
        var n = p(e),
          a = p(t);
        if (!n || !a) return !n && !a && String(e) === String(t);
        try {
          var r = Array.isArray(e),
            s = Array.isArray(t);
          if (r && s)
            return (
              e.length === t.length &&
              e.every(function (e, n) {
                return I(e, t[n]);
              })
            );
          if (e instanceof Date && t instanceof Date) return e.getTime() === t.getTime();
          if (r || s) return !1;
          var o = Object.keys(e),
            i = Object.keys(t);
          return (
            o.length === i.length &&
            o.every(function (n) {
              return I(e[n], t[n]);
            })
          );
        } catch (e) {
          return !1;
        }
      }
      function N(e, t) {
        for (var n = 0; n < e.length; n++) if (I(e[n], t)) return n;
        return -1;
      }
      function R(e) {
        var t = !1;
        return function () {
          t || ((t = !0), e.apply(this, arguments));
        };
      }
      var j = ['component', 'directive', 'filter'],
        D = [
          'beforeCreate',
          'created',
          'beforeMount',
          'mounted',
          'beforeUpdate',
          'updated',
          'beforeDestroy',
          'destroyed',
          'activated',
          'deactivated',
          'errorCaptured',
          'serverPrefetch',
        ],
        L = {
          optionMergeStrategies: Object.create(null),
          silent: !1,
          productionTip: !1,
          devtools: !1,
          performance: !1,
          errorHandler: null,
          warnHandler: null,
          ignoredElements: [],
          keyCodes: Object.create(null),
          isReservedTag: F,
          isReservedAttr: F,
          isUnknownElement: F,
          getTagNamespace: P,
          parsePlatformTagName: E,
          mustUseProp: F,
          async: !0,
          _lifecycleHooks: D,
        },
        U =
          /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
      function H(e) {
        var t = (e + '').charCodeAt(0);
        return 36 === t || 95 === t;
      }
      function V(e, t, n, a) {
        Object.defineProperty(e, t, { value: n, enumerable: !!a, writable: !0, configurable: !0 });
      }
      var z = new RegExp('[^' + U.source + '.$_\\d]');
      var q,
        W = '__proto__' in {},
        K = 'undefined' != typeof window,
        J = 'undefined' != typeof WXEnvironment && !!WXEnvironment.platform,
        Z = J && WXEnvironment.platform.toLowerCase(),
        G = K && window.navigator.userAgent.toLowerCase(),
        X = G && /msie|trident/.test(G),
        Y = G && G.indexOf('msie 9.0') > 0,
        Q = G && G.indexOf('edge/') > 0,
        ee = (G && G.indexOf('android'), (G && /iphone|ipad|ipod|ios/.test(G)) || 'ios' === Z),
        te =
          (G && /chrome\/\d+/.test(G), G && /phantomjs/.test(G), G && G.match(/firefox\/(\d+)/)),
        ne = {}.watch,
        ae = !1;
      if (K)
        try {
          var re = {};
          Object.defineProperty(re, 'passive', {
            get: function () {
              ae = !0;
            },
          }),
            window.addEventListener('test-passive', null, re);
        } catch (e) {}
      var se = function () {
          return (
            void 0 === q &&
              (q = !K && !J && void 0 !== e && e.process && 'server' === e.process.env.VUE_ENV),
            q
          );
        },
        oe = K && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
      function ie(e) {
        return 'function' == typeof e && /native code/.test(e.toString());
      }
      var pe,
        ue =
          'undefined' != typeof Symbol &&
          ie(Symbol) &&
          'undefined' != typeof Reflect &&
          ie(Reflect.ownKeys);
      pe =
        'undefined' != typeof Set && ie(Set)
          ? Set
          : (function () {
              function e() {
                this.set = Object.create(null);
              }
              return (
                (e.prototype.has = function (e) {
                  return !0 === this.set[e];
                }),
                (e.prototype.add = function (e) {
                  this.set[e] = !0;
                }),
                (e.prototype.clear = function () {
                  this.set = Object.create(null);
                }),
                e
              );
            })();
      var le = P,
        de = 0,
        ce = function () {
          (this.id = de++), (this.subs = []);
        };
      (ce.prototype.addSub = function (e) {
        this.subs.push(e);
      }),
        (ce.prototype.removeSub = function (e) {
          T(this.subs, e);
        }),
        (ce.prototype.depend = function () {
          ce.target && ce.target.addDep(this);
        }),
        (ce.prototype.notify = function () {
          var e = this.subs.slice();
          for (var t = 0, n = e.length; t < n; t++) e[t].update();
        }),
        (ce.target = null);
      var ye = [];
      function me(e) {
        ye.push(e), (ce.target = e);
      }
      function fe() {
        ye.pop(), (ce.target = ye[ye.length - 1]);
      }
      var he = function (e, t, n, a, r, s, o, i) {
          (this.tag = e),
            (this.data = t),
            (this.children = n),
            (this.text = a),
            (this.elm = r),
            (this.ns = void 0),
            (this.context = s),
            (this.fnContext = void 0),
            (this.fnOptions = void 0),
            (this.fnScopeId = void 0),
            (this.key = t && t.key),
            (this.componentOptions = o),
            (this.componentInstance = void 0),
            (this.parent = void 0),
            (this.raw = !1),
            (this.isStatic = !1),
            (this.isRootInsert = !0),
            (this.isComment = !1),
            (this.isCloned = !1),
            (this.isOnce = !1),
            (this.asyncFactory = i),
            (this.asyncMeta = void 0),
            (this.isAsyncPlaceholder = !1);
        },
        ve = { child: { configurable: !0 } };
      (ve.child.get = function () {
        return this.componentInstance;
      }),
        Object.defineProperties(he.prototype, ve);
      var ge = function (e) {
        void 0 === e && (e = '');
        var t = new he();
        return (t.text = e), (t.isComment = !0), t;
      };
      function Te(e) {
        return new he(void 0, void 0, void 0, String(e));
      }
      function be(e) {
        var t = new he(
          e.tag,
          e.data,
          e.children && e.children.slice(),
          e.text,
          e.elm,
          e.context,
          e.componentOptions,
          e.asyncFactory,
        );
        return (
          (t.ns = e.ns),
          (t.isStatic = e.isStatic),
          (t.key = e.key),
          (t.isComment = e.isComment),
          (t.fnContext = e.fnContext),
          (t.fnOptions = e.fnOptions),
          (t.fnScopeId = e.fnScopeId),
          (t.asyncMeta = e.asyncMeta),
          (t.isCloned = !0),
          t
        );
      }
      var we = Array.prototype,
        ke = Object.create(we);
      ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (e) {
        var t = we[e];
        V(ke, e, function () {
          for (var n = [], a = arguments.length; a--; ) n[a] = arguments[a];
          var r,
            s = t.apply(this, n),
            o = this.__ob__;
          switch (e) {
            case 'push':
            case 'unshift':
              r = n;
              break;
            case 'splice':
              r = n.slice(2);
          }
          return r && o.observeArray(r), o.dep.notify(), s;
        });
      });
      var Ae = Object.getOwnPropertyNames(ke),
        _e = !0;
      function xe(e) {
        _e = e;
      }
      var Oe = function (e) {
        (this.value = e),
          (this.dep = new ce()),
          (this.vmCount = 0),
          V(e, '__ob__', this),
          Array.isArray(e)
            ? (W
                ? (function (e, t) {
                    e.__proto__ = t;
                  })(e, ke)
                : (function (e, t, n) {
                    for (var a = 0, r = n.length; a < r; a++) {
                      var s = n[a];
                      V(e, s, t[s]);
                    }
                  })(e, ke, Ae),
              this.observeArray(e))
            : this.walk(e);
      };
      function Se(e, t) {
        var n;
        if (p(e) && !(e instanceof he))
          return (
            w(e, '__ob__') && e.__ob__ instanceof Oe
              ? (n = e.__ob__)
              : _e &&
                !se() &&
                (Array.isArray(e) || l(e)) &&
                Object.isExtensible(e) &&
                !e._isVue &&
                (n = new Oe(e)),
            t && n && n.vmCount++,
            n
          );
      }
      function Ce(e, t, n, a, r) {
        var s = new ce(),
          o = Object.getOwnPropertyDescriptor(e, t);
        if (!o || !1 !== o.configurable) {
          var i = o && o.get,
            p = o && o.set;
          (i && !p) || 2 !== arguments.length || (n = e[t]);
          var u = !r && Se(n);
          Object.defineProperty(e, t, {
            enumerable: !0,
            configurable: !0,
            get: function () {
              var t = i ? i.call(e) : n;
              return (
                ce.target && (s.depend(), u && (u.dep.depend(), Array.isArray(t) && $e(t))), t
              );
            },
            set: function (t) {
              var a = i ? i.call(e) : n;
              t === a ||
                (t != t && a != a) ||
                (i && !p) ||
                (p ? p.call(e, t) : (n = t), (u = !r && Se(t)), s.notify());
            },
          });
        }
      }
      function Be(e, t, n) {
        if (Array.isArray(e) && c(t))
          return (e.length = Math.max(e.length, t)), e.splice(t, 1, n), n;
        if (t in e && !(t in Object.prototype)) return (e[t] = n), n;
        var a = e.__ob__;
        return e._isVue || (a && a.vmCount)
          ? n
          : a
          ? (Ce(a.value, t, n), a.dep.notify(), n)
          : ((e[t] = n), n);
      }
      function Me(e, t) {
        if (Array.isArray(e) && c(t)) e.splice(t, 1);
        else {
          var n = e.__ob__;
          e._isVue || (n && n.vmCount) || (w(e, t) && (delete e[t], n && n.dep.notify()));
        }
      }
      function $e(e) {
        for (var t = void 0, n = 0, a = e.length; n < a; n++)
          (t = e[n]) && t.__ob__ && t.__ob__.dep.depend(), Array.isArray(t) && $e(t);
      }
      (Oe.prototype.walk = function (e) {
        for (var t = Object.keys(e), n = 0; n < t.length; n++) Ce(e, t[n]);
      }),
        (Oe.prototype.observeArray = function (e) {
          for (var t = 0, n = e.length; t < n; t++) Se(e[t]);
        });
      var Pe = L.optionMergeStrategies;
      function Fe(e, t) {
        if (!t) return e;
        for (var n, a, r, s = ue ? Reflect.ownKeys(t) : Object.keys(t), o = 0; o < s.length; o++)
          '__ob__' !== (n = s[o]) &&
            ((a = e[n]), (r = t[n]), w(e, n) ? a !== r && l(a) && l(r) && Fe(a, r) : Be(e, n, r));
        return e;
      }
      function Ee(e, t, n) {
        return n
          ? function () {
              var a = 'function' == typeof t ? t.call(n, n) : t,
                r = 'function' == typeof e ? e.call(n, n) : e;
              return a ? Fe(a, r) : r;
            }
          : t
          ? e
            ? function () {
                return Fe(
                  'function' == typeof t ? t.call(this, this) : t,
                  'function' == typeof e ? e.call(this, this) : e,
                );
              }
            : t
          : e;
      }
      function Ie(e, t) {
        var n = t ? (e ? e.concat(t) : Array.isArray(t) ? t : [t]) : e;
        return n
          ? (function (e) {
              for (var t = [], n = 0; n < e.length; n++) -1 === t.indexOf(e[n]) && t.push(e[n]);
              return t;
            })(n)
          : n;
      }
      function Ne(e, t, n, a) {
        var r = Object.create(e || null);
        return t ? M(r, t) : r;
      }
      (Pe.data = function (e, t, n) {
        return n ? Ee(e, t, n) : t && 'function' != typeof t ? e : Ee(e, t);
      }),
        D.forEach(function (e) {
          Pe[e] = Ie;
        }),
        j.forEach(function (e) {
          Pe[e + 's'] = Ne;
        }),
        (Pe.watch = function (e, t, n, a) {
          if ((e === ne && (e = void 0), t === ne && (t = void 0), !t))
            return Object.create(e || null);
          if (!e) return t;
          var r = {};
          for (var s in (M(r, e), t)) {
            var o = r[s],
              i = t[s];
            o && !Array.isArray(o) && (o = [o]),
              (r[s] = o ? o.concat(i) : Array.isArray(i) ? i : [i]);
          }
          return r;
        }),
        (Pe.props =
          Pe.methods =
          Pe.inject =
          Pe.computed =
            function (e, t, n, a) {
              if (!e) return t;
              var r = Object.create(null);
              return M(r, e), t && M(r, t), r;
            }),
        (Pe.provide = Ee);
      var Re = function (e, t) {
        return void 0 === t ? e : t;
      };
      function je(e, t, n) {
        if (
          ('function' == typeof t && (t = t.options),
          (function (e, t) {
            var n = e.props;
            if (n) {
              var a,
                r,
                s = {};
              if (Array.isArray(n))
                for (a = n.length; a--; )
                  'string' == typeof (r = n[a]) && (s[_(r)] = { type: null });
              else if (l(n)) for (var o in n) (r = n[o]), (s[_(o)] = l(r) ? r : { type: r });
              else 0;
              e.props = s;
            }
          })(t),
          (function (e, t) {
            var n = e.inject;
            if (n) {
              var a = (e.inject = {});
              if (Array.isArray(n)) for (var r = 0; r < n.length; r++) a[n[r]] = { from: n[r] };
              else if (l(n))
                for (var s in n) {
                  var o = n[s];
                  a[s] = l(o) ? M({ from: s }, o) : { from: o };
                }
              else 0;
            }
          })(t),
          (function (e) {
            var t = e.directives;
            if (t)
              for (var n in t) {
                var a = t[n];
                'function' == typeof a && (t[n] = { bind: a, update: a });
              }
          })(t),
          !t._base && (t.extends && (e = je(e, t.extends, n)), t.mixins))
        )
          for (var a = 0, r = t.mixins.length; a < r; a++) e = je(e, t.mixins[a], n);
        var s,
          o = {};
        for (s in e) i(s);
        for (s in t) w(e, s) || i(s);
        function i(a) {
          var r = Pe[a] || Re;
          o[a] = r(e[a], t[a], n, a);
        }
        return o;
      }
      function De(e, t, n, a) {
        if ('string' == typeof n) {
          var r = e[t];
          if (w(r, n)) return r[n];
          var s = _(n);
          if (w(r, s)) return r[s];
          var o = x(s);
          return w(r, o) ? r[o] : r[n] || r[s] || r[o];
        }
      }
      function Le(e, t, n, a) {
        var r = t[e],
          s = !w(n, e),
          o = n[e],
          i = Ve(Boolean, r.type);
        if (i > -1)
          if (s && !w(r, 'default')) o = !1;
          else if ('' === o || o === S(e)) {
            var p = Ve(String, r.type);
            (p < 0 || i < p) && (o = !0);
          }
        if (void 0 === o) {
          o = (function (e, t, n) {
            if (!w(t, 'default')) return;
            var a = t.default;
            0;
            if (
              e &&
              e.$options.propsData &&
              void 0 === e.$options.propsData[n] &&
              void 0 !== e._props[n]
            )
              return e._props[n];
            return 'function' == typeof a && 'Function' !== Ue(t.type) ? a.call(e) : a;
          })(a, r, e);
          var u = _e;
          xe(!0), Se(o), xe(u);
        }
        return o;
      }
      function Ue(e) {
        var t = e && e.toString().match(/^\s*function (\w+)/);
        return t ? t[1] : '';
      }
      function He(e, t) {
        return Ue(e) === Ue(t);
      }
      function Ve(e, t) {
        if (!Array.isArray(t)) return He(t, e) ? 0 : -1;
        for (var n = 0, a = t.length; n < a; n++) if (He(t[n], e)) return n;
        return -1;
      }
      function ze(e, t, n) {
        me();
        try {
          if (t)
            for (var a = t; (a = a.$parent); ) {
              var r = a.$options.errorCaptured;
              if (r)
                for (var s = 0; s < r.length; s++)
                  try {
                    if (!1 === r[s].call(a, e, t, n)) return;
                  } catch (e) {
                    We(e, a, 'errorCaptured hook');
                  }
            }
          We(e, t, n);
        } finally {
          fe();
        }
      }
      function qe(e, t, n, a, r) {
        var s;
        try {
          (s = n ? e.apply(t, n) : e.call(t)) &&
            !s._isVue &&
            y(s) &&
            !s._handled &&
            (s.catch(function (e) {
              return ze(e, a, r + ' (Promise/async)');
            }),
            (s._handled = !0));
        } catch (e) {
          ze(e, a, r);
        }
        return s;
      }
      function We(e, t, n) {
        if (L.errorHandler)
          try {
            return L.errorHandler.call(null, e, t, n);
          } catch (t) {
            t !== e && Ke(t, null, 'config.errorHandler');
          }
        Ke(e, t, n);
      }
      function Ke(e, t, n) {
        if ((!K && !J) || 'undefined' == typeof console) throw e;
        console.error(e);
      }
      var Je,
        Ze = !1,
        Ge = [],
        Xe = !1;
      function Ye() {
        Xe = !1;
        var e = Ge.slice(0);
        Ge.length = 0;
        for (var t = 0; t < e.length; t++) e[t]();
      }
      if ('undefined' != typeof Promise && ie(Promise)) {
        var Qe = Promise.resolve();
        (Je = function () {
          Qe.then(Ye), ee && setTimeout(P);
        }),
          (Ze = !0);
      } else if (
        X ||
        'undefined' == typeof MutationObserver ||
        (!ie(MutationObserver) &&
          '[object MutationObserverConstructor]' !== MutationObserver.toString())
      )
        Je =
          void 0 !== n && ie(n)
            ? function () {
                n(Ye);
              }
            : function () {
                setTimeout(Ye, 0);
              };
      else {
        var et = 1,
          tt = new MutationObserver(Ye),
          nt = document.createTextNode(String(et));
        tt.observe(nt, { characterData: !0 }),
          (Je = function () {
            (et = (et + 1) % 2), (nt.data = String(et));
          }),
          (Ze = !0);
      }
      function at(e, t) {
        var n;
        if (
          (Ge.push(function () {
            if (e)
              try {
                e.call(t);
              } catch (e) {
                ze(e, t, 'nextTick');
              }
            else n && n(t);
          }),
          Xe || ((Xe = !0), Je()),
          !e && 'undefined' != typeof Promise)
        )
          return new Promise(function (e) {
            n = e;
          });
      }
      var rt = new pe();
      function st(e) {
        !(function e(t, n) {
          var a,
            r,
            s = Array.isArray(t);
          if ((!s && !p(t)) || Object.isFrozen(t) || t instanceof he) return;
          if (t.__ob__) {
            var o = t.__ob__.dep.id;
            if (n.has(o)) return;
            n.add(o);
          }
          if (s) for (a = t.length; a--; ) e(t[a], n);
          else for (r = Object.keys(t), a = r.length; a--; ) e(t[r[a]], n);
        })(e, rt),
          rt.clear();
      }
      var ot = k(function (e) {
        var t = '&' === e.charAt(0),
          n = '~' === (e = t ? e.slice(1) : e).charAt(0),
          a = '!' === (e = n ? e.slice(1) : e).charAt(0);
        return { name: (e = a ? e.slice(1) : e), once: n, capture: a, passive: t };
      });
      function it(e, t) {
        function n() {
          var e = arguments,
            a = n.fns;
          if (!Array.isArray(a)) return qe(a, null, arguments, t, 'v-on handler');
          for (var r = a.slice(), s = 0; s < r.length; s++) qe(r[s], null, e, t, 'v-on handler');
        }
        return (n.fns = e), n;
      }
      function pt(e, t, n, a, s, i) {
        var p, u, l, d;
        for (p in e)
          (u = e[p]),
            (l = t[p]),
            (d = ot(p)),
            r(u) ||
              (r(l)
                ? (r(u.fns) && (u = e[p] = it(u, i)),
                  o(d.once) && (u = e[p] = s(d.name, u, d.capture)),
                  n(d.name, u, d.capture, d.passive, d.params))
                : u !== l && ((l.fns = u), (e[p] = l)));
        for (p in t) r(e[p]) && a((d = ot(p)).name, t[p], d.capture);
      }
      function ut(e, t, n) {
        var a;
        e instanceof he && (e = e.data.hook || (e.data.hook = {}));
        var i = e[t];
        function p() {
          n.apply(this, arguments), T(a.fns, p);
        }
        r(i) ? (a = it([p])) : s(i.fns) && o(i.merged) ? (a = i).fns.push(p) : (a = it([i, p])),
          (a.merged = !0),
          (e[t] = a);
      }
      function lt(e, t, n, a, r) {
        if (s(t)) {
          if (w(t, n)) return (e[n] = t[n]), r || delete t[n], !0;
          if (w(t, a)) return (e[n] = t[a]), r || delete t[a], !0;
        }
        return !1;
      }
      function dt(e) {
        return i(e)
          ? [Te(e)]
          : Array.isArray(e)
          ? (function e(t, n) {
              var a,
                p,
                u,
                l,
                d = [];
              for (a = 0; a < t.length; a++)
                r((p = t[a])) ||
                  'boolean' == typeof p ||
                  ((u = d.length - 1),
                  (l = d[u]),
                  Array.isArray(p)
                    ? p.length > 0 &&
                      (ct((p = e(p, (n || '') + '_' + a))[0]) &&
                        ct(l) &&
                        ((d[u] = Te(l.text + p[0].text)), p.shift()),
                      d.push.apply(d, p))
                    : i(p)
                    ? ct(l)
                      ? (d[u] = Te(l.text + p))
                      : '' !== p && d.push(Te(p))
                    : ct(p) && ct(l)
                    ? (d[u] = Te(l.text + p.text))
                    : (o(t._isVList) &&
                        s(p.tag) &&
                        r(p.key) &&
                        s(n) &&
                        (p.key = '__vlist' + n + '_' + a + '__'),
                      d.push(p)));
              return d;
            })(e)
          : void 0;
      }
      function ct(e) {
        return s(e) && s(e.text) && !1 === e.isComment;
      }
      function yt(e, t) {
        if (e) {
          for (
            var n = Object.create(null), a = ue ? Reflect.ownKeys(e) : Object.keys(e), r = 0;
            r < a.length;
            r++
          ) {
            var s = a[r];
            if ('__ob__' !== s) {
              for (var o = e[s].from, i = t; i; ) {
                if (i._provided && w(i._provided, o)) {
                  n[s] = i._provided[o];
                  break;
                }
                i = i.$parent;
              }
              if (!i)
                if ('default' in e[s]) {
                  var p = e[s].default;
                  n[s] = 'function' == typeof p ? p.call(t) : p;
                } else 0;
            }
          }
          return n;
        }
      }
      function mt(e, t) {
        if (!e || !e.length) return {};
        for (var n = {}, a = 0, r = e.length; a < r; a++) {
          var s = e[a],
            o = s.data;
          if (
            (o && o.attrs && o.attrs.slot && delete o.attrs.slot,
            (s.context !== t && s.fnContext !== t) || !o || null == o.slot)
          )
            (n.default || (n.default = [])).push(s);
          else {
            var i = o.slot,
              p = n[i] || (n[i] = []);
            'template' === s.tag ? p.push.apply(p, s.children || []) : p.push(s);
          }
        }
        for (var u in n) n[u].every(ft) && delete n[u];
        return n;
      }
      function ft(e) {
        return (e.isComment && !e.asyncFactory) || ' ' === e.text;
      }
      function ht(e, t, n) {
        var r,
          s = Object.keys(t).length > 0,
          o = e ? !!e.$stable : !s,
          i = e && e.$key;
        if (e) {
          if (e._normalized) return e._normalized;
          if (o && n && n !== a && i === n.$key && !s && !n.$hasNormal) return n;
          for (var p in ((r = {}), e)) e[p] && '$' !== p[0] && (r[p] = vt(t, p, e[p]));
        } else r = {};
        for (var u in t) u in r || (r[u] = gt(t, u));
        return (
          e && Object.isExtensible(e) && (e._normalized = r),
          V(r, '$stable', o),
          V(r, '$key', i),
          V(r, '$hasNormal', s),
          r
        );
      }
      function vt(e, t, n) {
        var a = function () {
          var e = arguments.length ? n.apply(null, arguments) : n({});
          return (e = e && 'object' == typeof e && !Array.isArray(e) ? [e] : dt(e)) &&
            (0 === e.length || (1 === e.length && e[0].isComment))
            ? void 0
            : e;
        };
        return (
          n.proxy && Object.defineProperty(e, t, { get: a, enumerable: !0, configurable: !0 }), a
        );
      }
      function gt(e, t) {
        return function () {
          return e[t];
        };
      }
      function Tt(e, t) {
        var n, a, r, o, i;
        if (Array.isArray(e) || 'string' == typeof e)
          for (n = new Array(e.length), a = 0, r = e.length; a < r; a++) n[a] = t(e[a], a);
        else if ('number' == typeof e)
          for (n = new Array(e), a = 0; a < e; a++) n[a] = t(a + 1, a);
        else if (p(e))
          if (ue && e[Symbol.iterator]) {
            n = [];
            for (var u = e[Symbol.iterator](), l = u.next(); !l.done; )
              n.push(t(l.value, n.length)), (l = u.next());
          } else
            for (o = Object.keys(e), n = new Array(o.length), a = 0, r = o.length; a < r; a++)
              (i = o[a]), (n[a] = t(e[i], i, a));
        return s(n) || (n = []), (n._isVList = !0), n;
      }
      function bt(e, t, n, a) {
        var r,
          s = this.$scopedSlots[e];
        s
          ? ((n = n || {}), a && (n = M(M({}, a), n)), (r = s(n) || t))
          : (r = this.$slots[e] || t);
        var o = n && n.slot;
        return o ? this.$createElement('template', { slot: o }, r) : r;
      }
      function wt(e) {
        return De(this.$options, 'filters', e) || E;
      }
      function kt(e, t) {
        return Array.isArray(e) ? -1 === e.indexOf(t) : e !== t;
      }
      function At(e, t, n, a, r) {
        var s = L.keyCodes[t] || n;
        return r && a && !L.keyCodes[t] ? kt(r, a) : s ? kt(s, e) : a ? S(a) !== t : void 0;
      }
      function _t(e, t, n, a, r) {
        if (n)
          if (p(n)) {
            var s;
            Array.isArray(n) && (n = $(n));
            var o = function (o) {
              if ('class' === o || 'style' === o || g(o)) s = e;
              else {
                var i = e.attrs && e.attrs.type;
                s =
                  a || L.mustUseProp(t, i, o)
                    ? e.domProps || (e.domProps = {})
                    : e.attrs || (e.attrs = {});
              }
              var p = _(o),
                u = S(o);
              p in s ||
                u in s ||
                ((s[o] = n[o]),
                r &&
                  ((e.on || (e.on = {}))['update:' + o] = function (e) {
                    n[o] = e;
                  }));
            };
            for (var i in n) o(i);
          } else;
        return e;
      }
      function xt(e, t) {
        var n = this._staticTrees || (this._staticTrees = []),
          a = n[e];
        return (
          (a && !t) ||
            St(
              (a = n[e] = this.$options.staticRenderFns[e].call(this._renderProxy, null, this)),
              '__static__' + e,
              !1,
            ),
          a
        );
      }
      function Ot(e, t, n) {
        return St(e, '__once__' + t + (n ? '_' + n : ''), !0), e;
      }
      function St(e, t, n) {
        if (Array.isArray(e))
          for (var a = 0; a < e.length; a++)
            e[a] && 'string' != typeof e[a] && Ct(e[a], t + '_' + a, n);
        else Ct(e, t, n);
      }
      function Ct(e, t, n) {
        (e.isStatic = !0), (e.key = t), (e.isOnce = n);
      }
      function Bt(e, t) {
        if (t)
          if (l(t)) {
            var n = (e.on = e.on ? M({}, e.on) : {});
            for (var a in t) {
              var r = n[a],
                s = t[a];
              n[a] = r ? [].concat(r, s) : s;
            }
          } else;
        return e;
      }
      function Mt(e, t, n, a) {
        t = t || { $stable: !n };
        for (var r = 0; r < e.length; r++) {
          var s = e[r];
          Array.isArray(s) ? Mt(s, t, n) : s && (s.proxy && (s.fn.proxy = !0), (t[s.key] = s.fn));
        }
        return a && (t.$key = a), t;
      }
      function $t(e, t) {
        for (var n = 0; n < t.length; n += 2) {
          var a = t[n];
          'string' == typeof a && a && (e[t[n]] = t[n + 1]);
        }
        return e;
      }
      function Pt(e, t) {
        return 'string' == typeof e ? t + e : e;
      }
      function Ft(e) {
        (e._o = Ot),
          (e._n = f),
          (e._s = m),
          (e._l = Tt),
          (e._t = bt),
          (e._q = I),
          (e._i = N),
          (e._m = xt),
          (e._f = wt),
          (e._k = At),
          (e._b = _t),
          (e._v = Te),
          (e._e = ge),
          (e._u = Mt),
          (e._g = Bt),
          (e._d = $t),
          (e._p = Pt);
      }
      function Et(e, t, n, r, s) {
        var i,
          p = this,
          u = s.options;
        w(r, '_uid') ? ((i = Object.create(r))._original = r) : ((i = r), (r = r._original));
        var l = o(u._compiled),
          d = !l;
        (this.data = e),
          (this.props = t),
          (this.children = n),
          (this.parent = r),
          (this.listeners = e.on || a),
          (this.injections = yt(u.inject, r)),
          (this.slots = function () {
            return p.$slots || ht(e.scopedSlots, (p.$slots = mt(n, r))), p.$slots;
          }),
          Object.defineProperty(this, 'scopedSlots', {
            enumerable: !0,
            get: function () {
              return ht(e.scopedSlots, this.slots());
            },
          }),
          l &&
            ((this.$options = u),
            (this.$slots = this.slots()),
            (this.$scopedSlots = ht(e.scopedSlots, this.$slots))),
          u._scopeId
            ? (this._c = function (e, t, n, a) {
                var s = Ut(i, e, t, n, a, d);
                return (
                  s && !Array.isArray(s) && ((s.fnScopeId = u._scopeId), (s.fnContext = r)), s
                );
              })
            : (this._c = function (e, t, n, a) {
                return Ut(i, e, t, n, a, d);
              });
      }
      function It(e, t, n, a, r) {
        var s = be(e);
        return (
          (s.fnContext = n),
          (s.fnOptions = a),
          t.slot && ((s.data || (s.data = {})).slot = t.slot),
          s
        );
      }
      function Nt(e, t) {
        for (var n in t) e[_(n)] = t[n];
      }
      Ft(Et.prototype);
      var Rt = {
          init: function (e, t) {
            if (e.componentInstance && !e.componentInstance._isDestroyed && e.data.keepAlive) {
              var n = e;
              Rt.prepatch(n, n);
            } else {
              (e.componentInstance = (function (e, t) {
                var n = { _isComponent: !0, _parentVnode: e, parent: t },
                  a = e.data.inlineTemplate;
                s(a) && ((n.render = a.render), (n.staticRenderFns = a.staticRenderFns));
                return new e.componentOptions.Ctor(n);
              })(e, Xt)).$mount(t ? e.elm : void 0, t);
            }
          },
          prepatch: function (e, t) {
            var n = t.componentOptions;
            !(function (e, t, n, r, s) {
              0;
              var o = r.data.scopedSlots,
                i = e.$scopedSlots,
                p = !!(
                  (o && !o.$stable) ||
                  (i !== a && !i.$stable) ||
                  (o && e.$scopedSlots.$key !== o.$key)
                ),
                u = !!(s || e.$options._renderChildren || p);
              (e.$options._parentVnode = r), (e.$vnode = r), e._vnode && (e._vnode.parent = r);
              if (
                ((e.$options._renderChildren = s),
                (e.$attrs = r.data.attrs || a),
                (e.$listeners = n || a),
                t && e.$options.props)
              ) {
                xe(!1);
                for (var l = e._props, d = e.$options._propKeys || [], c = 0; c < d.length; c++) {
                  var y = d[c],
                    m = e.$options.props;
                  l[y] = Le(y, m, t, e);
                }
                xe(!0), (e.$options.propsData = t);
              }
              n = n || a;
              var f = e.$options._parentListeners;
              (e.$options._parentListeners = n),
                Gt(e, n, f),
                u && ((e.$slots = mt(s, r.context)), e.$forceUpdate());
              0;
            })(
              (t.componentInstance = e.componentInstance),
              n.propsData,
              n.listeners,
              t,
              n.children,
            );
          },
          insert: function (e) {
            var t,
              n = e.context,
              a = e.componentInstance;
            a._isMounted || ((a._isMounted = !0), tn(a, 'mounted')),
              e.data.keepAlive &&
                (n._isMounted ? (((t = a)._inactive = !1), an.push(t)) : en(a, !0));
          },
          destroy: function (e) {
            var t = e.componentInstance;
            t._isDestroyed ||
              (e.data.keepAlive
                ? (function e(t, n) {
                    if (n && ((t._directInactive = !0), Qt(t))) return;
                    if (!t._inactive) {
                      t._inactive = !0;
                      for (var a = 0; a < t.$children.length; a++) e(t.$children[a]);
                      tn(t, 'deactivated');
                    }
                  })(t, !0)
                : t.$destroy());
          },
        },
        jt = Object.keys(Rt);
      function Dt(e, t, n, i, u) {
        if (!r(e)) {
          var l = n.$options._base;
          if ((p(e) && (e = l.extend(e)), 'function' == typeof e)) {
            var d;
            if (
              r(e.cid) &&
              void 0 ===
                (e = (function (e, t) {
                  if (o(e.error) && s(e.errorComp)) return e.errorComp;
                  if (s(e.resolved)) return e.resolved;
                  var n = Vt;
                  n && s(e.owners) && -1 === e.owners.indexOf(n) && e.owners.push(n);
                  if (o(e.loading) && s(e.loadingComp)) return e.loadingComp;
                  if (n && !s(e.owners)) {
                    var a = (e.owners = [n]),
                      i = !0,
                      u = null,
                      l = null;
                    n.$on('hook:destroyed', function () {
                      return T(a, n);
                    });
                    var d = function (e) {
                        for (var t = 0, n = a.length; t < n; t++) a[t].$forceUpdate();
                        e &&
                          ((a.length = 0),
                          null !== u && (clearTimeout(u), (u = null)),
                          null !== l && (clearTimeout(l), (l = null)));
                      },
                      c = R(function (n) {
                        (e.resolved = zt(n, t)), i ? (a.length = 0) : d(!0);
                      }),
                      m = R(function (t) {
                        s(e.errorComp) && ((e.error = !0), d(!0));
                      }),
                      f = e(c, m);
                    return (
                      p(f) &&
                        (y(f)
                          ? r(e.resolved) && f.then(c, m)
                          : y(f.component) &&
                            (f.component.then(c, m),
                            s(f.error) && (e.errorComp = zt(f.error, t)),
                            s(f.loading) &&
                              ((e.loadingComp = zt(f.loading, t)),
                              0 === f.delay
                                ? (e.loading = !0)
                                : (u = setTimeout(function () {
                                    (u = null),
                                      r(e.resolved) && r(e.error) && ((e.loading = !0), d(!1));
                                  }, f.delay || 200))),
                            s(f.timeout) &&
                              (l = setTimeout(function () {
                                (l = null), r(e.resolved) && m(null);
                              }, f.timeout)))),
                      (i = !1),
                      e.loading ? e.loadingComp : e.resolved
                    );
                  }
                })((d = e), l))
            )
              return (function (e, t, n, a, r) {
                var s = ge();
                return (
                  (s.asyncFactory = e),
                  (s.asyncMeta = { data: t, context: n, children: a, tag: r }),
                  s
                );
              })(d, t, n, i, u);
            (t = t || {}),
              _n(e),
              s(t.model) &&
                (function (e, t) {
                  var n = (e.model && e.model.prop) || 'value',
                    a = (e.model && e.model.event) || 'input';
                  (t.attrs || (t.attrs = {}))[n] = t.model.value;
                  var r = t.on || (t.on = {}),
                    o = r[a],
                    i = t.model.callback;
                  s(o)
                    ? (Array.isArray(o) ? -1 === o.indexOf(i) : o !== i) && (r[a] = [i].concat(o))
                    : (r[a] = i);
                })(e.options, t);
            var c = (function (e, t, n) {
              var a = t.options.props;
              if (!r(a)) {
                var o = {},
                  i = e.attrs,
                  p = e.props;
                if (s(i) || s(p))
                  for (var u in a) {
                    var l = S(u);
                    lt(o, p, u, l, !0) || lt(o, i, u, l, !1);
                  }
                return o;
              }
            })(t, e);
            if (o(e.options.functional))
              return (function (e, t, n, r, o) {
                var i = e.options,
                  p = {},
                  u = i.props;
                if (s(u)) for (var l in u) p[l] = Le(l, u, t || a);
                else s(n.attrs) && Nt(p, n.attrs), s(n.props) && Nt(p, n.props);
                var d = new Et(n, p, o, r, e),
                  c = i.render.call(null, d._c, d);
                if (c instanceof he) return It(c, n, d.parent, i, d);
                if (Array.isArray(c)) {
                  for (var y = dt(c) || [], m = new Array(y.length), f = 0; f < y.length; f++)
                    m[f] = It(y[f], n, d.parent, i, d);
                  return m;
                }
              })(e, c, t, n, i);
            var m = t.on;
            if (((t.on = t.nativeOn), o(e.options.abstract))) {
              var f = t.slot;
              (t = {}), f && (t.slot = f);
            }
            !(function (e) {
              for (var t = e.hook || (e.hook = {}), n = 0; n < jt.length; n++) {
                var a = jt[n],
                  r = t[a],
                  s = Rt[a];
                r === s || (r && r._merged) || (t[a] = r ? Lt(s, r) : s);
              }
            })(t);
            var h = e.options.name || u;
            return new he(
              'vue-component-' + e.cid + (h ? '-' + h : ''),
              t,
              void 0,
              void 0,
              void 0,
              n,
              { Ctor: e, propsData: c, listeners: m, tag: u, children: i },
              d,
            );
          }
        }
      }
      function Lt(e, t) {
        var n = function (n, a) {
          e(n, a), t(n, a);
        };
        return (n._merged = !0), n;
      }
      function Ut(e, t, n, a, u, l) {
        return (
          (Array.isArray(n) || i(n)) && ((u = a), (a = n), (n = void 0)),
          o(l) && (u = 2),
          (function (e, t, n, a, i) {
            if (s(n) && s(n.__ob__)) return ge();
            s(n) && s(n.is) && (t = n.is);
            if (!t) return ge();
            0;
            Array.isArray(a) &&
              'function' == typeof a[0] &&
              (((n = n || {}).scopedSlots = { default: a[0] }), (a.length = 0));
            2 === i
              ? (a = dt(a))
              : 1 === i &&
                (a = (function (e) {
                  for (var t = 0; t < e.length; t++)
                    if (Array.isArray(e[t])) return Array.prototype.concat.apply([], e);
                  return e;
                })(a));
            var u, l;
            if ('string' == typeof t) {
              var d;
              (l = (e.$vnode && e.$vnode.ns) || L.getTagNamespace(t)),
                (u = L.isReservedTag(t)
                  ? new he(L.parsePlatformTagName(t), n, a, void 0, void 0, e)
                  : (n && n.pre) || !s((d = De(e.$options, 'components', t)))
                  ? new he(t, n, a, void 0, void 0, e)
                  : Dt(d, n, e, a, t));
            } else u = Dt(t, n, e, a);
            return Array.isArray(u)
              ? u
              : s(u)
              ? (s(l) &&
                  (function e(t, n, a) {
                    (t.ns = n), 'foreignObject' === t.tag && ((n = void 0), (a = !0));
                    if (s(t.children))
                      for (var i = 0, p = t.children.length; i < p; i++) {
                        var u = t.children[i];
                        s(u.tag) && (r(u.ns) || (o(a) && 'svg' !== u.tag)) && e(u, n, a);
                      }
                  })(u, l),
                s(n) &&
                  (function (e) {
                    p(e.style) && st(e.style);
                    p(e.class) && st(e.class);
                  })(n),
                u)
              : ge();
          })(e, t, n, a, u)
        );
      }
      var Ht,
        Vt = null;
      function zt(e, t) {
        return (
          (e.__esModule || (ue && 'Module' === e[Symbol.toStringTag])) && (e = e.default),
          p(e) ? t.extend(e) : e
        );
      }
      function qt(e) {
        return e.isComment && e.asyncFactory;
      }
      function Wt(e) {
        if (Array.isArray(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            if (s(n) && (s(n.componentOptions) || qt(n))) return n;
          }
      }
      function Kt(e, t) {
        Ht.$on(e, t);
      }
      function Jt(e, t) {
        Ht.$off(e, t);
      }
      function Zt(e, t) {
        var n = Ht;
        return function a() {
          var r = t.apply(null, arguments);
          null !== r && n.$off(e, a);
        };
      }
      function Gt(e, t, n) {
        (Ht = e), pt(t, n || {}, Kt, Jt, Zt, e), (Ht = void 0);
      }
      var Xt = null;
      function Yt(e) {
        var t = Xt;
        return (
          (Xt = e),
          function () {
            Xt = t;
          }
        );
      }
      function Qt(e) {
        for (; e && (e = e.$parent); ) if (e._inactive) return !0;
        return !1;
      }
      function en(e, t) {
        if (t) {
          if (((e._directInactive = !1), Qt(e))) return;
        } else if (e._directInactive) return;
        if (e._inactive || null === e._inactive) {
          e._inactive = !1;
          for (var n = 0; n < e.$children.length; n++) en(e.$children[n]);
          tn(e, 'activated');
        }
      }
      function tn(e, t) {
        me();
        var n = e.$options[t],
          a = t + ' hook';
        if (n) for (var r = 0, s = n.length; r < s; r++) qe(n[r], e, null, e, a);
        e._hasHookEvent && e.$emit('hook:' + t), fe();
      }
      var nn = [],
        an = [],
        rn = {},
        sn = !1,
        on = !1,
        pn = 0;
      var un = 0,
        ln = Date.now;
      if (K && !X) {
        var dn = window.performance;
        dn &&
          'function' == typeof dn.now &&
          ln() > document.createEvent('Event').timeStamp &&
          (ln = function () {
            return dn.now();
          });
      }
      function cn() {
        var e, t;
        for (
          un = ln(),
            on = !0,
            nn.sort(function (e, t) {
              return e.id - t.id;
            }),
            pn = 0;
          pn < nn.length;
          pn++
        )
          (e = nn[pn]).before && e.before(), (t = e.id), (rn[t] = null), e.run();
        var n = an.slice(),
          a = nn.slice();
        (pn = nn.length = an.length = 0),
          (rn = {}),
          (sn = on = !1),
          (function (e) {
            for (var t = 0; t < e.length; t++) (e[t]._inactive = !0), en(e[t], !0);
          })(n),
          (function (e) {
            var t = e.length;
            for (; t--; ) {
              var n = e[t],
                a = n.vm;
              a._watcher === n && a._isMounted && !a._isDestroyed && tn(a, 'updated');
            }
          })(a),
          oe && L.devtools && oe.emit('flush');
      }
      var yn = 0,
        mn = function (e, t, n, a, r) {
          (this.vm = e),
            r && (e._watcher = this),
            e._watchers.push(this),
            a
              ? ((this.deep = !!a.deep),
                (this.user = !!a.user),
                (this.lazy = !!a.lazy),
                (this.sync = !!a.sync),
                (this.before = a.before))
              : (this.deep = this.user = this.lazy = this.sync = !1),
            (this.cb = n),
            (this.id = ++yn),
            (this.active = !0),
            (this.dirty = this.lazy),
            (this.deps = []),
            (this.newDeps = []),
            (this.depIds = new pe()),
            (this.newDepIds = new pe()),
            (this.expression = ''),
            'function' == typeof t
              ? (this.getter = t)
              : ((this.getter = (function (e) {
                  if (!z.test(e)) {
                    var t = e.split('.');
                    return function (e) {
                      for (var n = 0; n < t.length; n++) {
                        if (!e) return;
                        e = e[t[n]];
                      }
                      return e;
                    };
                  }
                })(t)),
                this.getter || (this.getter = P)),
            (this.value = this.lazy ? void 0 : this.get());
        };
      (mn.prototype.get = function () {
        var e;
        me(this);
        var t = this.vm;
        try {
          e = this.getter.call(t, t);
        } catch (e) {
          if (!this.user) throw e;
          ze(e, t, 'getter for watcher "' + this.expression + '"');
        } finally {
          this.deep && st(e), fe(), this.cleanupDeps();
        }
        return e;
      }),
        (mn.prototype.addDep = function (e) {
          var t = e.id;
          this.newDepIds.has(t) ||
            (this.newDepIds.add(t), this.newDeps.push(e), this.depIds.has(t) || e.addSub(this));
        }),
        (mn.prototype.cleanupDeps = function () {
          for (var e = this.deps.length; e--; ) {
            var t = this.deps[e];
            this.newDepIds.has(t.id) || t.removeSub(this);
          }
          var n = this.depIds;
          (this.depIds = this.newDepIds),
            (this.newDepIds = n),
            this.newDepIds.clear(),
            (n = this.deps),
            (this.deps = this.newDeps),
            (this.newDeps = n),
            (this.newDeps.length = 0);
        }),
        (mn.prototype.update = function () {
          this.lazy
            ? (this.dirty = !0)
            : this.sync
            ? this.run()
            : (function (e) {
                var t = e.id;
                if (null == rn[t]) {
                  if (((rn[t] = !0), on)) {
                    for (var n = nn.length - 1; n > pn && nn[n].id > e.id; ) n--;
                    nn.splice(n + 1, 0, e);
                  } else nn.push(e);
                  sn || ((sn = !0), at(cn));
                }
              })(this);
        }),
        (mn.prototype.run = function () {
          if (this.active) {
            var e = this.get();
            if (e !== this.value || p(e) || this.deep) {
              var t = this.value;
              if (((this.value = e), this.user))
                try {
                  this.cb.call(this.vm, e, t);
                } catch (e) {
                  ze(e, this.vm, 'callback for watcher "' + this.expression + '"');
                }
              else this.cb.call(this.vm, e, t);
            }
          }
        }),
        (mn.prototype.evaluate = function () {
          (this.value = this.get()), (this.dirty = !1);
        }),
        (mn.prototype.depend = function () {
          for (var e = this.deps.length; e--; ) this.deps[e].depend();
        }),
        (mn.prototype.teardown = function () {
          if (this.active) {
            this.vm._isBeingDestroyed || T(this.vm._watchers, this);
            for (var e = this.deps.length; e--; ) this.deps[e].removeSub(this);
            this.active = !1;
          }
        });
      var fn = { enumerable: !0, configurable: !0, get: P, set: P };
      function hn(e, t, n) {
        (fn.get = function () {
          return this[t][n];
        }),
          (fn.set = function (e) {
            this[t][n] = e;
          }),
          Object.defineProperty(e, n, fn);
      }
      function vn(e) {
        e._watchers = [];
        var t = e.$options;
        t.props &&
          (function (e, t) {
            var n = e.$options.propsData || {},
              a = (e._props = {}),
              r = (e.$options._propKeys = []);
            e.$parent && xe(!1);
            var s = function (s) {
              r.push(s);
              var o = Le(s, t, n, e);
              Ce(a, s, o), s in e || hn(e, '_props', s);
            };
            for (var o in t) s(o);
            xe(!0);
          })(e, t.props),
          t.methods &&
            (function (e, t) {
              e.$options.props;
              for (var n in t) e[n] = 'function' != typeof t[n] ? P : C(t[n], e);
            })(e, t.methods),
          t.data
            ? (function (e) {
                var t = e.$options.data;
                l(
                  (t = e._data =
                    'function' == typeof t
                      ? (function (e, t) {
                          me();
                          try {
                            return e.call(t, t);
                          } catch (e) {
                            return ze(e, t, 'data()'), {};
                          } finally {
                            fe();
                          }
                        })(t, e)
                      : t || {}),
                ) || (t = {});
                var n = Object.keys(t),
                  a = e.$options.props,
                  r = (e.$options.methods, n.length);
                for (; r--; ) {
                  var s = n[r];
                  0, (a && w(a, s)) || H(s) || hn(e, '_data', s);
                }
                Se(t, !0);
              })(e)
            : Se((e._data = {}), !0),
          t.computed &&
            (function (e, t) {
              var n = (e._computedWatchers = Object.create(null)),
                a = se();
              for (var r in t) {
                var s = t[r],
                  o = 'function' == typeof s ? s : s.get;
                0, a || (n[r] = new mn(e, o || P, P, gn)), r in e || Tn(e, r, s);
              }
            })(e, t.computed),
          t.watch &&
            t.watch !== ne &&
            (function (e, t) {
              for (var n in t) {
                var a = t[n];
                if (Array.isArray(a)) for (var r = 0; r < a.length; r++) kn(e, n, a[r]);
                else kn(e, n, a);
              }
            })(e, t.watch);
      }
      var gn = { lazy: !0 };
      function Tn(e, t, n) {
        var a = !se();
        'function' == typeof n
          ? ((fn.get = a ? bn(t) : wn(n)), (fn.set = P))
          : ((fn.get = n.get ? (a && !1 !== n.cache ? bn(t) : wn(n.get)) : P),
            (fn.set = n.set || P)),
          Object.defineProperty(e, t, fn);
      }
      function bn(e) {
        return function () {
          var t = this._computedWatchers && this._computedWatchers[e];
          if (t) return t.dirty && t.evaluate(), ce.target && t.depend(), t.value;
        };
      }
      function wn(e) {
        return function () {
          return e.call(this, this);
        };
      }
      function kn(e, t, n, a) {
        return (
          l(n) && ((a = n), (n = n.handler)), 'string' == typeof n && (n = e[n]), e.$watch(t, n, a)
        );
      }
      var An = 0;
      function _n(e) {
        var t = e.options;
        if (e.super) {
          var n = _n(e.super);
          if (n !== e.superOptions) {
            e.superOptions = n;
            var a = (function (e) {
              var t,
                n = e.options,
                a = e.sealedOptions;
              for (var r in n) n[r] !== a[r] && (t || (t = {}), (t[r] = n[r]));
              return t;
            })(e);
            a && M(e.extendOptions, a),
              (t = e.options = je(n, e.extendOptions)).name && (t.components[t.name] = e);
          }
        }
        return t;
      }
      function xn(e) {
        this._init(e);
      }
      function On(e) {
        e.cid = 0;
        var t = 1;
        e.extend = function (e) {
          e = e || {};
          var n = this,
            a = n.cid,
            r = e._Ctor || (e._Ctor = {});
          if (r[a]) return r[a];
          var s = e.name || n.options.name;
          var o = function (e) {
            this._init(e);
          };
          return (
            ((o.prototype = Object.create(n.prototype)).constructor = o),
            (o.cid = t++),
            (o.options = je(n.options, e)),
            (o.super = n),
            o.options.props &&
              (function (e) {
                var t = e.options.props;
                for (var n in t) hn(e.prototype, '_props', n);
              })(o),
            o.options.computed &&
              (function (e) {
                var t = e.options.computed;
                for (var n in t) Tn(e.prototype, n, t[n]);
              })(o),
            (o.extend = n.extend),
            (o.mixin = n.mixin),
            (o.use = n.use),
            j.forEach(function (e) {
              o[e] = n[e];
            }),
            s && (o.options.components[s] = o),
            (o.superOptions = n.options),
            (o.extendOptions = e),
            (o.sealedOptions = M({}, o.options)),
            (r[a] = o),
            o
          );
        };
      }
      function Sn(e) {
        return e && (e.Ctor.options.name || e.tag);
      }
      function Cn(e, t) {
        return Array.isArray(e)
          ? e.indexOf(t) > -1
          : 'string' == typeof e
          ? e.split(',').indexOf(t) > -1
          : !!d(e) && e.test(t);
      }
      function Bn(e, t) {
        var n = e.cache,
          a = e.keys,
          r = e._vnode;
        for (var s in n) {
          var o = n[s];
          if (o) {
            var i = Sn(o.componentOptions);
            i && !t(i) && Mn(n, s, a, r);
          }
        }
      }
      function Mn(e, t, n, a) {
        var r = e[t];
        !r || (a && r.tag === a.tag) || r.componentInstance.$destroy(), (e[t] = null), T(n, t);
      }
      !(function (e) {
        e.prototype._init = function (e) {
          var t = this;
          (t._uid = An++),
            (t._isVue = !0),
            e && e._isComponent
              ? (function (e, t) {
                  var n = (e.$options = Object.create(e.constructor.options)),
                    a = t._parentVnode;
                  (n.parent = t.parent), (n._parentVnode = a);
                  var r = a.componentOptions;
                  (n.propsData = r.propsData),
                    (n._parentListeners = r.listeners),
                    (n._renderChildren = r.children),
                    (n._componentTag = r.tag),
                    t.render && ((n.render = t.render), (n.staticRenderFns = t.staticRenderFns));
                })(t, e)
              : (t.$options = je(_n(t.constructor), e || {}, t)),
            (t._renderProxy = t),
            (t._self = t),
            (function (e) {
              var t = e.$options,
                n = t.parent;
              if (n && !t.abstract) {
                for (; n.$options.abstract && n.$parent; ) n = n.$parent;
                n.$children.push(e);
              }
              (e.$parent = n),
                (e.$root = n ? n.$root : e),
                (e.$children = []),
                (e.$refs = {}),
                (e._watcher = null),
                (e._inactive = null),
                (e._directInactive = !1),
                (e._isMounted = !1),
                (e._isDestroyed = !1),
                (e._isBeingDestroyed = !1);
            })(t),
            (function (e) {
              (e._events = Object.create(null)), (e._hasHookEvent = !1);
              var t = e.$options._parentListeners;
              t && Gt(e, t);
            })(t),
            (function (e) {
              (e._vnode = null), (e._staticTrees = null);
              var t = e.$options,
                n = (e.$vnode = t._parentVnode),
                r = n && n.context;
              (e.$slots = mt(t._renderChildren, r)),
                (e.$scopedSlots = a),
                (e._c = function (t, n, a, r) {
                  return Ut(e, t, n, a, r, !1);
                }),
                (e.$createElement = function (t, n, a, r) {
                  return Ut(e, t, n, a, r, !0);
                });
              var s = n && n.data;
              Ce(e, '$attrs', (s && s.attrs) || a, null, !0),
                Ce(e, '$listeners', t._parentListeners || a, null, !0);
            })(t),
            tn(t, 'beforeCreate'),
            (function (e) {
              var t = yt(e.$options.inject, e);
              t &&
                (xe(!1),
                Object.keys(t).forEach(function (n) {
                  Ce(e, n, t[n]);
                }),
                xe(!0));
            })(t),
            vn(t),
            (function (e) {
              var t = e.$options.provide;
              t && (e._provided = 'function' == typeof t ? t.call(e) : t);
            })(t),
            tn(t, 'created'),
            t.$options.el && t.$mount(t.$options.el);
        };
      })(xn),
        (function (e) {
          var t = {
              get: function () {
                return this._data;
              },
            },
            n = {
              get: function () {
                return this._props;
              },
            };
          Object.defineProperty(e.prototype, '$data', t),
            Object.defineProperty(e.prototype, '$props', n),
            (e.prototype.$set = Be),
            (e.prototype.$delete = Me),
            (e.prototype.$watch = function (e, t, n) {
              if (l(t)) return kn(this, e, t, n);
              (n = n || {}).user = !0;
              var a = new mn(this, e, t, n);
              if (n.immediate)
                try {
                  t.call(this, a.value);
                } catch (e) {
                  ze(e, this, 'callback for immediate watcher "' + a.expression + '"');
                }
              return function () {
                a.teardown();
              };
            });
        })(xn),
        (function (e) {
          var t = /^hook:/;
          (e.prototype.$on = function (e, n) {
            var a = this;
            if (Array.isArray(e)) for (var r = 0, s = e.length; r < s; r++) a.$on(e[r], n);
            else
              (a._events[e] || (a._events[e] = [])).push(n), t.test(e) && (a._hasHookEvent = !0);
            return a;
          }),
            (e.prototype.$once = function (e, t) {
              var n = this;
              function a() {
                n.$off(e, a), t.apply(n, arguments);
              }
              return (a.fn = t), n.$on(e, a), n;
            }),
            (e.prototype.$off = function (e, t) {
              var n = this;
              if (!arguments.length) return (n._events = Object.create(null)), n;
              if (Array.isArray(e)) {
                for (var a = 0, r = e.length; a < r; a++) n.$off(e[a], t);
                return n;
              }
              var s,
                o = n._events[e];
              if (!o) return n;
              if (!t) return (n._events[e] = null), n;
              for (var i = o.length; i--; )
                if ((s = o[i]) === t || s.fn === t) {
                  o.splice(i, 1);
                  break;
                }
              return n;
            }),
            (e.prototype.$emit = function (e) {
              var t = this,
                n = t._events[e];
              if (n) {
                n = n.length > 1 ? B(n) : n;
                for (
                  var a = B(arguments, 1),
                    r = 'event handler for "' + e + '"',
                    s = 0,
                    o = n.length;
                  s < o;
                  s++
                )
                  qe(n[s], t, a, t, r);
              }
              return t;
            });
        })(xn),
        (function (e) {
          (e.prototype._update = function (e, t) {
            var n = this,
              a = n.$el,
              r = n._vnode,
              s = Yt(n);
            (n._vnode = e),
              (n.$el = r ? n.__patch__(r, e) : n.__patch__(n.$el, e, t, !1)),
              s(),
              a && (a.__vue__ = null),
              n.$el && (n.$el.__vue__ = n),
              n.$vnode && n.$parent && n.$vnode === n.$parent._vnode && (n.$parent.$el = n.$el);
          }),
            (e.prototype.$forceUpdate = function () {
              this._watcher && this._watcher.update();
            }),
            (e.prototype.$destroy = function () {
              var e = this;
              if (!e._isBeingDestroyed) {
                tn(e, 'beforeDestroy'), (e._isBeingDestroyed = !0);
                var t = e.$parent;
                !t || t._isBeingDestroyed || e.$options.abstract || T(t.$children, e),
                  e._watcher && e._watcher.teardown();
                for (var n = e._watchers.length; n--; ) e._watchers[n].teardown();
                e._data.__ob__ && e._data.__ob__.vmCount--,
                  (e._isDestroyed = !0),
                  e.__patch__(e._vnode, null),
                  tn(e, 'destroyed'),
                  e.$off(),
                  e.$el && (e.$el.__vue__ = null),
                  e.$vnode && (e.$vnode.parent = null);
              }
            });
        })(xn),
        (function (e) {
          Ft(e.prototype),
            (e.prototype.$nextTick = function (e) {
              return at(e, this);
            }),
            (e.prototype._render = function () {
              var e,
                t = this,
                n = t.$options,
                a = n.render,
                r = n._parentVnode;
              r && (t.$scopedSlots = ht(r.data.scopedSlots, t.$slots, t.$scopedSlots)),
                (t.$vnode = r);
              try {
                (Vt = t), (e = a.call(t._renderProxy, t.$createElement));
              } catch (n) {
                ze(n, t, 'render'), (e = t._vnode);
              } finally {
                Vt = null;
              }
              return (
                Array.isArray(e) && 1 === e.length && (e = e[0]),
                e instanceof he || (e = ge()),
                (e.parent = r),
                e
              );
            });
        })(xn);
      var $n = [String, RegExp, Array],
        Pn = {
          KeepAlive: {
            name: 'keep-alive',
            abstract: !0,
            props: { include: $n, exclude: $n, max: [String, Number] },
            created: function () {
              (this.cache = Object.create(null)), (this.keys = []);
            },
            destroyed: function () {
              for (var e in this.cache) Mn(this.cache, e, this.keys);
            },
            mounted: function () {
              var e = this;
              this.$watch('include', function (t) {
                Bn(e, function (e) {
                  return Cn(t, e);
                });
              }),
                this.$watch('exclude', function (t) {
                  Bn(e, function (e) {
                    return !Cn(t, e);
                  });
                });
            },
            render: function () {
              var e = this.$slots.default,
                t = Wt(e),
                n = t && t.componentOptions;
              if (n) {
                var a = Sn(n),
                  r = this.include,
                  s = this.exclude;
                if ((r && (!a || !Cn(r, a))) || (s && a && Cn(s, a))) return t;
                var o = this.cache,
                  i = this.keys,
                  p = null == t.key ? n.Ctor.cid + (n.tag ? '::' + n.tag : '') : t.key;
                o[p]
                  ? ((t.componentInstance = o[p].componentInstance), T(i, p), i.push(p))
                  : ((o[p] = t),
                    i.push(p),
                    this.max && i.length > parseInt(this.max) && Mn(o, i[0], i, this._vnode)),
                  (t.data.keepAlive = !0);
              }
              return t || (e && e[0]);
            },
          },
        };
      !(function (e) {
        var t = {
          get: function () {
            return L;
          },
        };
        Object.defineProperty(e, 'config', t),
          (e.util = { warn: le, extend: M, mergeOptions: je, defineReactive: Ce }),
          (e.set = Be),
          (e.delete = Me),
          (e.nextTick = at),
          (e.observable = function (e) {
            return Se(e), e;
          }),
          (e.options = Object.create(null)),
          j.forEach(function (t) {
            e.options[t + 's'] = Object.create(null);
          }),
          (e.options._base = e),
          M(e.options.components, Pn),
          (function (e) {
            e.use = function (e) {
              var t = this._installedPlugins || (this._installedPlugins = []);
              if (t.indexOf(e) > -1) return this;
              var n = B(arguments, 1);
              return (
                n.unshift(this),
                'function' == typeof e.install
                  ? e.install.apply(e, n)
                  : 'function' == typeof e && e.apply(null, n),
                t.push(e),
                this
              );
            };
          })(e),
          (function (e) {
            e.mixin = function (e) {
              return (this.options = je(this.options, e)), this;
            };
          })(e),
          On(e),
          (function (e) {
            j.forEach(function (t) {
              e[t] = function (e, n) {
                return n
                  ? ('component' === t &&
                      l(n) &&
                      ((n.name = n.name || e), (n = this.options._base.extend(n))),
                    'directive' === t && 'function' == typeof n && (n = { bind: n, update: n }),
                    (this.options[t + 's'][e] = n),
                    n)
                  : this.options[t + 's'][e];
              };
            });
          })(e);
      })(xn),
        Object.defineProperty(xn.prototype, '$isServer', { get: se }),
        Object.defineProperty(xn.prototype, '$ssrContext', {
          get: function () {
            return this.$vnode && this.$vnode.ssrContext;
          },
        }),
        Object.defineProperty(xn, 'FunctionalRenderContext', { value: Et }),
        (xn.version = '2.6.12');
      var Fn = h('style,class'),
        En = h('input,textarea,option,select,progress'),
        In = function (e, t, n) {
          return (
            ('value' === n && En(e) && 'button' !== t) ||
            ('selected' === n && 'option' === e) ||
            ('checked' === n && 'input' === e) ||
            ('muted' === n && 'video' === e)
          );
        },
        Nn = h('contenteditable,draggable,spellcheck'),
        Rn = h('events,caret,typing,plaintext-only'),
        jn = h(
          'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,translate,truespeed,typemustmatch,visible',
        ),
        Dn = 'http://www.w3.org/1999/xlink',
        Ln = function (e) {
          return ':' === e.charAt(5) && 'xlink' === e.slice(0, 5);
        },
        Un = function (e) {
          return Ln(e) ? e.slice(6, e.length) : '';
        },
        Hn = function (e) {
          return null == e || !1 === e;
        };
      function Vn(e) {
        for (var t = e.data, n = e, a = e; s(a.componentInstance); )
          (a = a.componentInstance._vnode) && a.data && (t = zn(a.data, t));
        for (; s((n = n.parent)); ) n && n.data && (t = zn(t, n.data));
        return (function (e, t) {
          if (s(e) || s(t)) return qn(e, Wn(t));
          return '';
        })(t.staticClass, t.class);
      }
      function zn(e, t) {
        return {
          staticClass: qn(e.staticClass, t.staticClass),
          class: s(e.class) ? [e.class, t.class] : t.class,
        };
      }
      function qn(e, t) {
        return e ? (t ? e + ' ' + t : e) : t || '';
      }
      function Wn(e) {
        return Array.isArray(e)
          ? (function (e) {
              for (var t, n = '', a = 0, r = e.length; a < r; a++)
                s((t = Wn(e[a]))) && '' !== t && (n && (n += ' '), (n += t));
              return n;
            })(e)
          : p(e)
          ? (function (e) {
              var t = '';
              for (var n in e) e[n] && (t && (t += ' '), (t += n));
              return t;
            })(e)
          : 'string' == typeof e
          ? e
          : '';
      }
      var Kn = { svg: 'http://www.w3.org/2000/svg', math: 'http://www.w3.org/1998/Math/MathML' },
        Jn = h(
          'html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot',
        ),
        Zn = h(
          'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
          !0,
        ),
        Gn = function (e) {
          return Jn(e) || Zn(e);
        };
      function Xn(e) {
        return Zn(e) ? 'svg' : 'math' === e ? 'math' : void 0;
      }
      var Yn = Object.create(null);
      var Qn = h('text,number,password,search,email,tel,url');
      function ea(e) {
        if ('string' == typeof e) {
          var t = document.querySelector(e);
          return t || document.createElement('div');
        }
        return e;
      }
      var ta = Object.freeze({
          createElement: function (e, t) {
            var n = document.createElement(e);
            return (
              'select' !== e ||
                (t.data &&
                  t.data.attrs &&
                  void 0 !== t.data.attrs.multiple &&
                  n.setAttribute('multiple', 'multiple')),
              n
            );
          },
          createElementNS: function (e, t) {
            return document.createElementNS(Kn[e], t);
          },
          createTextNode: function (e) {
            return document.createTextNode(e);
          },
          createComment: function (e) {
            return document.createComment(e);
          },
          insertBefore: function (e, t, n) {
            e.insertBefore(t, n);
          },
          removeChild: function (e, t) {
            e.removeChild(t);
          },
          appendChild: function (e, t) {
            e.appendChild(t);
          },
          parentNode: function (e) {
            return e.parentNode;
          },
          nextSibling: function (e) {
            return e.nextSibling;
          },
          tagName: function (e) {
            return e.tagName;
          },
          setTextContent: function (e, t) {
            e.textContent = t;
          },
          setStyleScope: function (e, t) {
            e.setAttribute(t, '');
          },
        }),
        na = {
          create: function (e, t) {
            aa(t);
          },
          update: function (e, t) {
            e.data.ref !== t.data.ref && (aa(e, !0), aa(t));
          },
          destroy: function (e) {
            aa(e, !0);
          },
        };
      function aa(e, t) {
        var n = e.data.ref;
        if (s(n)) {
          var a = e.context,
            r = e.componentInstance || e.elm,
            o = a.$refs;
          t
            ? Array.isArray(o[n])
              ? T(o[n], r)
              : o[n] === r && (o[n] = void 0)
            : e.data.refInFor
            ? Array.isArray(o[n])
              ? o[n].indexOf(r) < 0 && o[n].push(r)
              : (o[n] = [r])
            : (o[n] = r);
        }
      }
      var ra = new he('', {}, []),
        sa = ['create', 'activate', 'update', 'remove', 'destroy'];
      function oa(e, t) {
        return (
          e.key === t.key &&
          ((e.tag === t.tag &&
            e.isComment === t.isComment &&
            s(e.data) === s(t.data) &&
            (function (e, t) {
              if ('input' !== e.tag) return !0;
              var n,
                a = s((n = e.data)) && s((n = n.attrs)) && n.type,
                r = s((n = t.data)) && s((n = n.attrs)) && n.type;
              return a === r || (Qn(a) && Qn(r));
            })(e, t)) ||
            (o(e.isAsyncPlaceholder) &&
              e.asyncFactory === t.asyncFactory &&
              r(t.asyncFactory.error)))
        );
      }
      function ia(e, t, n) {
        var a,
          r,
          o = {};
        for (a = t; a <= n; ++a) s((r = e[a].key)) && (o[r] = a);
        return o;
      }
      var pa = {
        create: ua,
        update: ua,
        destroy: function (e) {
          ua(e, ra);
        },
      };
      function ua(e, t) {
        (e.data.directives || t.data.directives) &&
          (function (e, t) {
            var n,
              a,
              r,
              s = e === ra,
              o = t === ra,
              i = da(e.data.directives, e.context),
              p = da(t.data.directives, t.context),
              u = [],
              l = [];
            for (n in p)
              (a = i[n]),
                (r = p[n]),
                a
                  ? ((r.oldValue = a.value),
                    (r.oldArg = a.arg),
                    ya(r, 'update', t, e),
                    r.def && r.def.componentUpdated && l.push(r))
                  : (ya(r, 'bind', t, e), r.def && r.def.inserted && u.push(r));
            if (u.length) {
              var d = function () {
                for (var n = 0; n < u.length; n++) ya(u[n], 'inserted', t, e);
              };
              s ? ut(t, 'insert', d) : d();
            }
            l.length &&
              ut(t, 'postpatch', function () {
                for (var n = 0; n < l.length; n++) ya(l[n], 'componentUpdated', t, e);
              });
            if (!s) for (n in i) p[n] || ya(i[n], 'unbind', e, e, o);
          })(e, t);
      }
      var la = Object.create(null);
      function da(e, t) {
        var n,
          a,
          r = Object.create(null);
        if (!e) return r;
        for (n = 0; n < e.length; n++)
          (a = e[n]).modifiers || (a.modifiers = la),
            (r[ca(a)] = a),
            (a.def = De(t.$options, 'directives', a.name));
        return r;
      }
      function ca(e) {
        return e.rawName || e.name + '.' + Object.keys(e.modifiers || {}).join('.');
      }
      function ya(e, t, n, a, r) {
        var s = e.def && e.def[t];
        if (s)
          try {
            s(n.elm, e, n, a, r);
          } catch (a) {
            ze(a, n.context, 'directive ' + e.name + ' ' + t + ' hook');
          }
      }
      var ma = [na, pa];
      function fa(e, t) {
        var n = t.componentOptions;
        if (
          !((s(n) && !1 === n.Ctor.options.inheritAttrs) || (r(e.data.attrs) && r(t.data.attrs)))
        ) {
          var a,
            o,
            i = t.elm,
            p = e.data.attrs || {},
            u = t.data.attrs || {};
          for (a in (s(u.__ob__) && (u = t.data.attrs = M({}, u)), u))
            (o = u[a]), p[a] !== o && ha(i, a, o);
          for (a in ((X || Q) && u.value !== p.value && ha(i, 'value', u.value), p))
            r(u[a]) && (Ln(a) ? i.removeAttributeNS(Dn, Un(a)) : Nn(a) || i.removeAttribute(a));
        }
      }
      function ha(e, t, n) {
        e.tagName.indexOf('-') > -1
          ? va(e, t, n)
          : jn(t)
          ? Hn(n)
            ? e.removeAttribute(t)
            : ((n = 'allowfullscreen' === t && 'EMBED' === e.tagName ? 'true' : t),
              e.setAttribute(t, n))
          : Nn(t)
          ? e.setAttribute(
              t,
              (function (e, t) {
                return Hn(t) || 'false' === t
                  ? 'false'
                  : 'contenteditable' === e && Rn(t)
                  ? t
                  : 'true';
              })(t, n),
            )
          : Ln(t)
          ? Hn(n)
            ? e.removeAttributeNS(Dn, Un(t))
            : e.setAttributeNS(Dn, t, n)
          : va(e, t, n);
      }
      function va(e, t, n) {
        if (Hn(n)) e.removeAttribute(t);
        else {
          if (
            X &&
            !Y &&
            'TEXTAREA' === e.tagName &&
            'placeholder' === t &&
            '' !== n &&
            !e.__ieph
          ) {
            var a = function (t) {
              t.stopImmediatePropagation(), e.removeEventListener('input', a);
            };
            e.addEventListener('input', a), (e.__ieph = !0);
          }
          e.setAttribute(t, n);
        }
      }
      var ga = { create: fa, update: fa };
      function Ta(e, t) {
        var n = t.elm,
          a = t.data,
          o = e.data;
        if (!(r(a.staticClass) && r(a.class) && (r(o) || (r(o.staticClass) && r(o.class))))) {
          var i = Vn(t),
            p = n._transitionClasses;
          s(p) && (i = qn(i, Wn(p))),
            i !== n._prevClass && (n.setAttribute('class', i), (n._prevClass = i));
        }
      }
      var ba,
        wa,
        ka,
        Aa,
        _a,
        xa,
        Oa = { create: Ta, update: Ta },
        Sa = /[\w).+\-_$\]]/;
      function Ca(e) {
        var t,
          n,
          a,
          r,
          s,
          o = !1,
          i = !1,
          p = !1,
          u = !1,
          l = 0,
          d = 0,
          c = 0,
          y = 0;
        for (a = 0; a < e.length; a++)
          if (((n = t), (t = e.charCodeAt(a)), o)) 39 === t && 92 !== n && (o = !1);
          else if (i) 34 === t && 92 !== n && (i = !1);
          else if (p) 96 === t && 92 !== n && (p = !1);
          else if (u) 47 === t && 92 !== n && (u = !1);
          else if (
            124 !== t ||
            124 === e.charCodeAt(a + 1) ||
            124 === e.charCodeAt(a - 1) ||
            l ||
            d ||
            c
          ) {
            switch (t) {
              case 34:
                i = !0;
                break;
              case 39:
                o = !0;
                break;
              case 96:
                p = !0;
                break;
              case 40:
                c++;
                break;
              case 41:
                c--;
                break;
              case 91:
                d++;
                break;
              case 93:
                d--;
                break;
              case 123:
                l++;
                break;
              case 125:
                l--;
            }
            if (47 === t) {
              for (var m = a - 1, f = void 0; m >= 0 && ' ' === (f = e.charAt(m)); m--);
              (f && Sa.test(f)) || (u = !0);
            }
          } else void 0 === r ? ((y = a + 1), (r = e.slice(0, a).trim())) : h();
        function h() {
          (s || (s = [])).push(e.slice(y, a).trim()), (y = a + 1);
        }
        if ((void 0 === r ? (r = e.slice(0, a).trim()) : 0 !== y && h(), s))
          for (a = 0; a < s.length; a++) r = Ba(r, s[a]);
        return r;
      }
      function Ba(e, t) {
        var n = t.indexOf('(');
        if (n < 0) return '_f("' + t + '")(' + e + ')';
        var a = t.slice(0, n),
          r = t.slice(n + 1);
        return '_f("' + a + '")(' + e + (')' !== r ? ',' + r : r);
      }
      function Ma(e, t) {
        console.error('[Vue compiler]: ' + e);
      }
      function $a(e, t) {
        return e
          ? e
              .map(function (e) {
                return e[t];
              })
              .filter(function (e) {
                return e;
              })
          : [];
      }
      function Pa(e, t, n, a, r) {
        (e.props || (e.props = [])).push(Ua({ name: t, value: n, dynamic: r }, a)), (e.plain = !1);
      }
      function Fa(e, t, n, a, r) {
        (r ? e.dynamicAttrs || (e.dynamicAttrs = []) : e.attrs || (e.attrs = [])).push(
          Ua({ name: t, value: n, dynamic: r }, a),
        ),
          (e.plain = !1);
      }
      function Ea(e, t, n, a) {
        (e.attrsMap[t] = n), e.attrsList.push(Ua({ name: t, value: n }, a));
      }
      function Ia(e, t, n, a, r, s, o, i) {
        (e.directives || (e.directives = [])).push(
          Ua({ name: t, rawName: n, value: a, arg: r, isDynamicArg: s, modifiers: o }, i),
        ),
          (e.plain = !1);
      }
      function Na(e, t, n) {
        return n ? '_p(' + t + ',"' + e + '")' : e + t;
      }
      function Ra(e, t, n, r, s, o, i, p) {
        var u;
        (r = r || a).right
          ? p
            ? (t = '(' + t + ")==='click'?'contextmenu':(" + t + ')')
            : 'click' === t && ((t = 'contextmenu'), delete r.right)
          : r.middle &&
            (p
              ? (t = '(' + t + ")==='click'?'mouseup':(" + t + ')')
              : 'click' === t && (t = 'mouseup')),
          r.capture && (delete r.capture, (t = Na('!', t, p))),
          r.once && (delete r.once, (t = Na('~', t, p))),
          r.passive && (delete r.passive, (t = Na('&', t, p))),
          r.native
            ? (delete r.native, (u = e.nativeEvents || (e.nativeEvents = {})))
            : (u = e.events || (e.events = {}));
        var l = Ua({ value: n.trim(), dynamic: p }, i);
        r !== a && (l.modifiers = r);
        var d = u[t];
        Array.isArray(d) ? (s ? d.unshift(l) : d.push(l)) : (u[t] = d ? (s ? [l, d] : [d, l]) : l),
          (e.plain = !1);
      }
      function ja(e, t, n) {
        var a = Da(e, ':' + t) || Da(e, 'v-bind:' + t);
        if (null != a) return Ca(a);
        if (!1 !== n) {
          var r = Da(e, t);
          if (null != r) return JSON.stringify(r);
        }
      }
      function Da(e, t, n) {
        var a;
        if (null != (a = e.attrsMap[t]))
          for (var r = e.attrsList, s = 0, o = r.length; s < o; s++)
            if (r[s].name === t) {
              r.splice(s, 1);
              break;
            }
        return n && delete e.attrsMap[t], a;
      }
      function La(e, t) {
        for (var n = e.attrsList, a = 0, r = n.length; a < r; a++) {
          var s = n[a];
          if (t.test(s.name)) return n.splice(a, 1), s;
        }
      }
      function Ua(e, t) {
        return t && (null != t.start && (e.start = t.start), null != t.end && (e.end = t.end)), e;
      }
      function Ha(e, t, n) {
        var a = n || {},
          r = a.number,
          s = '$$v';
        a.trim && (s = "(typeof $$v === 'string'? $$v.trim(): $$v)"), r && (s = '_n(' + s + ')');
        var o = Va(t, s);
        e.model = {
          value: '(' + t + ')',
          expression: JSON.stringify(t),
          callback: 'function ($$v) {' + o + '}',
        };
      }
      function Va(e, t) {
        var n = (function (e) {
          if (((e = e.trim()), (ba = e.length), e.indexOf('[') < 0 || e.lastIndexOf(']') < ba - 1))
            return (Aa = e.lastIndexOf('.')) > -1
              ? { exp: e.slice(0, Aa), key: '"' + e.slice(Aa + 1) + '"' }
              : { exp: e, key: null };
          (wa = e), (Aa = _a = xa = 0);
          for (; !qa(); ) Wa((ka = za())) ? Ja(ka) : 91 === ka && Ka(ka);
          return { exp: e.slice(0, _a), key: e.slice(_a + 1, xa) };
        })(e);
        return null === n.key ? e + '=' + t : '$set(' + n.exp + ', ' + n.key + ', ' + t + ')';
      }
      function za() {
        return wa.charCodeAt(++Aa);
      }
      function qa() {
        return Aa >= ba;
      }
      function Wa(e) {
        return 34 === e || 39 === e;
      }
      function Ka(e) {
        var t = 1;
        for (_a = Aa; !qa(); )
          if (Wa((e = za()))) Ja(e);
          else if ((91 === e && t++, 93 === e && t--, 0 === t)) {
            xa = Aa;
            break;
          }
      }
      function Ja(e) {
        for (var t = e; !qa() && (e = za()) !== t; );
      }
      var Za;
      function Ga(e, t, n) {
        var a = Za;
        return function r() {
          var s = t.apply(null, arguments);
          null !== s && Qa(e, r, n, a);
        };
      }
      var Xa = Ze && !(te && Number(te[1]) <= 53);
      function Ya(e, t, n, a) {
        if (Xa) {
          var r = un,
            s = t;
          t = s._wrapper = function (e) {
            if (
              e.target === e.currentTarget ||
              e.timeStamp >= r ||
              e.timeStamp <= 0 ||
              e.target.ownerDocument !== document
            )
              return s.apply(this, arguments);
          };
        }
        Za.addEventListener(e, t, ae ? { capture: n, passive: a } : n);
      }
      function Qa(e, t, n, a) {
        (a || Za).removeEventListener(e, t._wrapper || t, n);
      }
      function er(e, t) {
        if (!r(e.data.on) || !r(t.data.on)) {
          var n = t.data.on || {},
            a = e.data.on || {};
          (Za = t.elm),
            (function (e) {
              if (s(e.__r)) {
                var t = X ? 'change' : 'input';
                (e[t] = [].concat(e.__r, e[t] || [])), delete e.__r;
              }
              s(e.__c) && ((e.change = [].concat(e.__c, e.change || [])), delete e.__c);
            })(n),
            pt(n, a, Ya, Qa, Ga, t.context),
            (Za = void 0);
        }
      }
      var tr,
        nr = { create: er, update: er };
      function ar(e, t) {
        if (!r(e.data.domProps) || !r(t.data.domProps)) {
          var n,
            a,
            o = t.elm,
            i = e.data.domProps || {},
            p = t.data.domProps || {};
          for (n in (s(p.__ob__) && (p = t.data.domProps = M({}, p)), i)) n in p || (o[n] = '');
          for (n in p) {
            if (((a = p[n]), 'textContent' === n || 'innerHTML' === n)) {
              if ((t.children && (t.children.length = 0), a === i[n])) continue;
              1 === o.childNodes.length && o.removeChild(o.childNodes[0]);
            }
            if ('value' === n && 'PROGRESS' !== o.tagName) {
              o._value = a;
              var u = r(a) ? '' : String(a);
              rr(o, u) && (o.value = u);
            } else if ('innerHTML' === n && Zn(o.tagName) && r(o.innerHTML)) {
              (tr = tr || document.createElement('div')).innerHTML = '<svg>' + a + '</svg>';
              for (var l = tr.firstChild; o.firstChild; ) o.removeChild(o.firstChild);
              for (; l.firstChild; ) o.appendChild(l.firstChild);
            } else if (a !== i[n])
              try {
                o[n] = a;
              } catch (e) {}
          }
        }
      }
      function rr(e, t) {
        return (
          !e.composing &&
          ('OPTION' === e.tagName ||
            (function (e, t) {
              var n = !0;
              try {
                n = document.activeElement !== e;
              } catch (e) {}
              return n && e.value !== t;
            })(e, t) ||
            (function (e, t) {
              var n = e.value,
                a = e._vModifiers;
              if (s(a)) {
                if (a.number) return f(n) !== f(t);
                if (a.trim) return n.trim() !== t.trim();
              }
              return n !== t;
            })(e, t))
        );
      }
      var sr = { create: ar, update: ar },
        or = k(function (e) {
          var t = {},
            n = /:(.+)/;
          return (
            e.split(/;(?![^(]*\))/g).forEach(function (e) {
              if (e) {
                var a = e.split(n);
                a.length > 1 && (t[a[0].trim()] = a[1].trim());
              }
            }),
            t
          );
        });
      function ir(e) {
        var t = pr(e.style);
        return e.staticStyle ? M(e.staticStyle, t) : t;
      }
      function pr(e) {
        return Array.isArray(e) ? $(e) : 'string' == typeof e ? or(e) : e;
      }
      var ur,
        lr = /^--/,
        dr = /\s*!important$/,
        cr = function (e, t, n) {
          if (lr.test(t)) e.style.setProperty(t, n);
          else if (dr.test(n)) e.style.setProperty(S(t), n.replace(dr, ''), 'important');
          else {
            var a = mr(t);
            if (Array.isArray(n)) for (var r = 0, s = n.length; r < s; r++) e.style[a] = n[r];
            else e.style[a] = n;
          }
        },
        yr = ['Webkit', 'Moz', 'ms'],
        mr = k(function (e) {
          if (
            ((ur = ur || document.createElement('div').style), 'filter' !== (e = _(e)) && e in ur)
          )
            return e;
          for (var t = e.charAt(0).toUpperCase() + e.slice(1), n = 0; n < yr.length; n++) {
            var a = yr[n] + t;
            if (a in ur) return a;
          }
        });
      function fr(e, t) {
        var n = t.data,
          a = e.data;
        if (!(r(n.staticStyle) && r(n.style) && r(a.staticStyle) && r(a.style))) {
          var o,
            i,
            p = t.elm,
            u = a.staticStyle,
            l = a.normalizedStyle || a.style || {},
            d = u || l,
            c = pr(t.data.style) || {};
          t.data.normalizedStyle = s(c.__ob__) ? M({}, c) : c;
          var y = (function (e, t) {
            var n,
              a = {};
            if (t)
              for (var r = e; r.componentInstance; )
                (r = r.componentInstance._vnode) && r.data && (n = ir(r.data)) && M(a, n);
            (n = ir(e.data)) && M(a, n);
            for (var s = e; (s = s.parent); ) s.data && (n = ir(s.data)) && M(a, n);
            return a;
          })(t, !0);
          for (i in d) r(y[i]) && cr(p, i, '');
          for (i in y) (o = y[i]) !== d[i] && cr(p, i, null == o ? '' : o);
        }
      }
      var hr = { create: fr, update: fr },
        vr = /\s+/;
      function gr(e, t) {
        if (t && (t = t.trim()))
          if (e.classList)
            t.indexOf(' ') > -1
              ? t.split(vr).forEach(function (t) {
                  return e.classList.add(t);
                })
              : e.classList.add(t);
          else {
            var n = ' ' + (e.getAttribute('class') || '') + ' ';
            n.indexOf(' ' + t + ' ') < 0 && e.setAttribute('class', (n + t).trim());
          }
      }
      function Tr(e, t) {
        if (t && (t = t.trim()))
          if (e.classList)
            t.indexOf(' ') > -1
              ? t.split(vr).forEach(function (t) {
                  return e.classList.remove(t);
                })
              : e.classList.remove(t),
              e.classList.length || e.removeAttribute('class');
          else {
            for (
              var n = ' ' + (e.getAttribute('class') || '') + ' ', a = ' ' + t + ' ';
              n.indexOf(a) >= 0;

            )
              n = n.replace(a, ' ');
            (n = n.trim()) ? e.setAttribute('class', n) : e.removeAttribute('class');
          }
      }
      function br(e) {
        if (e) {
          if ('object' == typeof e) {
            var t = {};
            return !1 !== e.css && M(t, wr(e.name || 'v')), M(t, e), t;
          }
          return 'string' == typeof e ? wr(e) : void 0;
        }
      }
      var wr = k(function (e) {
          return {
            enterClass: e + '-enter',
            enterToClass: e + '-enter-to',
            enterActiveClass: e + '-enter-active',
            leaveClass: e + '-leave',
            leaveToClass: e + '-leave-to',
            leaveActiveClass: e + '-leave-active',
          };
        }),
        kr = K && !Y,
        Ar = 'transition',
        _r = 'transitionend',
        xr = 'animation',
        Or = 'animationend';
      kr &&
        (void 0 === window.ontransitionend &&
          void 0 !== window.onwebkittransitionend &&
          ((Ar = 'WebkitTransition'), (_r = 'webkitTransitionEnd')),
        void 0 === window.onanimationend &&
          void 0 !== window.onwebkitanimationend &&
          ((xr = 'WebkitAnimation'), (Or = 'webkitAnimationEnd')));
      var Sr = K
        ? window.requestAnimationFrame
          ? window.requestAnimationFrame.bind(window)
          : setTimeout
        : function (e) {
            return e();
          };
      function Cr(e) {
        Sr(function () {
          Sr(e);
        });
      }
      function Br(e, t) {
        var n = e._transitionClasses || (e._transitionClasses = []);
        n.indexOf(t) < 0 && (n.push(t), gr(e, t));
      }
      function Mr(e, t) {
        e._transitionClasses && T(e._transitionClasses, t), Tr(e, t);
      }
      function $r(e, t, n) {
        var a = Fr(e, t),
          r = a.type,
          s = a.timeout,
          o = a.propCount;
        if (!r) return n();
        var i = 'transition' === r ? _r : Or,
          p = 0,
          u = function () {
            e.removeEventListener(i, l), n();
          },
          l = function (t) {
            t.target === e && ++p >= o && u();
          };
        setTimeout(function () {
          p < o && u();
        }, s + 1),
          e.addEventListener(i, l);
      }
      var Pr = /\b(transform|all)(,|$)/;
      function Fr(e, t) {
        var n,
          a = window.getComputedStyle(e),
          r = (a[Ar + 'Delay'] || '').split(', '),
          s = (a[Ar + 'Duration'] || '').split(', '),
          o = Er(r, s),
          i = (a[xr + 'Delay'] || '').split(', '),
          p = (a[xr + 'Duration'] || '').split(', '),
          u = Er(i, p),
          l = 0,
          d = 0;
        return (
          'transition' === t
            ? o > 0 && ((n = 'transition'), (l = o), (d = s.length))
            : 'animation' === t
            ? u > 0 && ((n = 'animation'), (l = u), (d = p.length))
            : (d = (n = (l = Math.max(o, u)) > 0 ? (o > u ? 'transition' : 'animation') : null)
                ? 'transition' === n
                  ? s.length
                  : p.length
                : 0),
          {
            type: n,
            timeout: l,
            propCount: d,
            hasTransform: 'transition' === n && Pr.test(a[Ar + 'Property']),
          }
        );
      }
      function Er(e, t) {
        for (; e.length < t.length; ) e = e.concat(e);
        return Math.max.apply(
          null,
          t.map(function (t, n) {
            return Ir(t) + Ir(e[n]);
          }),
        );
      }
      function Ir(e) {
        return 1e3 * Number(e.slice(0, -1).replace(',', '.'));
      }
      function Nr(e, t) {
        var n = e.elm;
        s(n._leaveCb) && ((n._leaveCb.cancelled = !0), n._leaveCb());
        var a = br(e.data.transition);
        if (!r(a) && !s(n._enterCb) && 1 === n.nodeType) {
          for (
            var o = a.css,
              i = a.type,
              u = a.enterClass,
              l = a.enterToClass,
              d = a.enterActiveClass,
              c = a.appearClass,
              y = a.appearToClass,
              m = a.appearActiveClass,
              h = a.beforeEnter,
              v = a.enter,
              g = a.afterEnter,
              T = a.enterCancelled,
              b = a.beforeAppear,
              w = a.appear,
              k = a.afterAppear,
              A = a.appearCancelled,
              _ = a.duration,
              x = Xt,
              O = Xt.$vnode;
            O && O.parent;

          )
            (x = O.context), (O = O.parent);
          var S = !x._isMounted || !e.isRootInsert;
          if (!S || w || '' === w) {
            var C = S && c ? c : u,
              B = S && m ? m : d,
              M = S && y ? y : l,
              $ = (S && b) || h,
              P = S && 'function' == typeof w ? w : v,
              F = (S && k) || g,
              E = (S && A) || T,
              I = f(p(_) ? _.enter : _);
            0;
            var N = !1 !== o && !Y,
              j = Dr(P),
              D = (n._enterCb = R(function () {
                N && (Mr(n, M), Mr(n, B)),
                  D.cancelled ? (N && Mr(n, C), E && E(n)) : F && F(n),
                  (n._enterCb = null);
              }));
            e.data.show ||
              ut(e, 'insert', function () {
                var t = n.parentNode,
                  a = t && t._pending && t._pending[e.key];
                a && a.tag === e.tag && a.elm._leaveCb && a.elm._leaveCb(), P && P(n, D);
              }),
              $ && $(n),
              N &&
                (Br(n, C),
                Br(n, B),
                Cr(function () {
                  Mr(n, C),
                    D.cancelled || (Br(n, M), j || (jr(I) ? setTimeout(D, I) : $r(n, i, D)));
                })),
              e.data.show && (t && t(), P && P(n, D)),
              N || j || D();
          }
        }
      }
      function Rr(e, t) {
        var n = e.elm;
        s(n._enterCb) && ((n._enterCb.cancelled = !0), n._enterCb());
        var a = br(e.data.transition);
        if (r(a) || 1 !== n.nodeType) return t();
        if (!s(n._leaveCb)) {
          var o = a.css,
            i = a.type,
            u = a.leaveClass,
            l = a.leaveToClass,
            d = a.leaveActiveClass,
            c = a.beforeLeave,
            y = a.leave,
            m = a.afterLeave,
            h = a.leaveCancelled,
            v = a.delayLeave,
            g = a.duration,
            T = !1 !== o && !Y,
            b = Dr(y),
            w = f(p(g) ? g.leave : g);
          0;
          var k = (n._leaveCb = R(function () {
            n.parentNode && n.parentNode._pending && (n.parentNode._pending[e.key] = null),
              T && (Mr(n, l), Mr(n, d)),
              k.cancelled ? (T && Mr(n, u), h && h(n)) : (t(), m && m(n)),
              (n._leaveCb = null);
          }));
          v ? v(A) : A();
        }
        function A() {
          k.cancelled ||
            (!e.data.show &&
              n.parentNode &&
              ((n.parentNode._pending || (n.parentNode._pending = {}))[e.key] = e),
            c && c(n),
            T &&
              (Br(n, u),
              Br(n, d),
              Cr(function () {
                Mr(n, u), k.cancelled || (Br(n, l), b || (jr(w) ? setTimeout(k, w) : $r(n, i, k)));
              })),
            y && y(n, k),
            T || b || k());
        }
      }
      function jr(e) {
        return 'number' == typeof e && !isNaN(e);
      }
      function Dr(e) {
        if (r(e)) return !1;
        var t = e.fns;
        return s(t) ? Dr(Array.isArray(t) ? t[0] : t) : (e._length || e.length) > 1;
      }
      function Lr(e, t) {
        !0 !== t.data.show && Nr(t);
      }
      var Ur = (function (e) {
        var t,
          n,
          a = {},
          p = e.modules,
          u = e.nodeOps;
        for (t = 0; t < sa.length; ++t)
          for (a[sa[t]] = [], n = 0; n < p.length; ++n)
            s(p[n][sa[t]]) && a[sa[t]].push(p[n][sa[t]]);
        function l(e) {
          var t = u.parentNode(e);
          s(t) && u.removeChild(t, e);
        }
        function d(e, t, n, r, i, p, l) {
          if (
            (s(e.elm) && s(p) && (e = p[l] = be(e)),
            (e.isRootInsert = !i),
            !(function (e, t, n, r) {
              var i = e.data;
              if (s(i)) {
                var p = s(e.componentInstance) && i.keepAlive;
                if ((s((i = i.hook)) && s((i = i.init)) && i(e, !1), s(e.componentInstance)))
                  return (
                    c(e, t),
                    y(n, e.elm, r),
                    o(p) &&
                      (function (e, t, n, r) {
                        var o,
                          i = e;
                        for (; i.componentInstance; )
                          if (
                            ((i = i.componentInstance._vnode),
                            s((o = i.data)) && s((o = o.transition)))
                          ) {
                            for (o = 0; o < a.activate.length; ++o) a.activate[o](ra, i);
                            t.push(i);
                            break;
                          }
                        y(n, e.elm, r);
                      })(e, t, n, r),
                    !0
                  );
              }
            })(e, t, n, r))
          ) {
            var d = e.data,
              f = e.children,
              h = e.tag;
            s(h)
              ? ((e.elm = e.ns ? u.createElementNS(e.ns, h) : u.createElement(h, e)),
                g(e),
                m(e, f, t),
                s(d) && v(e, t),
                y(n, e.elm, r))
              : o(e.isComment)
              ? ((e.elm = u.createComment(e.text)), y(n, e.elm, r))
              : ((e.elm = u.createTextNode(e.text)), y(n, e.elm, r));
          }
        }
        function c(e, t) {
          s(e.data.pendingInsert) &&
            (t.push.apply(t, e.data.pendingInsert), (e.data.pendingInsert = null)),
            (e.elm = e.componentInstance.$el),
            f(e) ? (v(e, t), g(e)) : (aa(e), t.push(e));
        }
        function y(e, t, n) {
          s(e) && (s(n) ? u.parentNode(n) === e && u.insertBefore(e, t, n) : u.appendChild(e, t));
        }
        function m(e, t, n) {
          if (Array.isArray(t)) {
            0;
            for (var a = 0; a < t.length; ++a) d(t[a], n, e.elm, null, !0, t, a);
          } else i(e.text) && u.appendChild(e.elm, u.createTextNode(String(e.text)));
        }
        function f(e) {
          for (; e.componentInstance; ) e = e.componentInstance._vnode;
          return s(e.tag);
        }
        function v(e, n) {
          for (var r = 0; r < a.create.length; ++r) a.create[r](ra, e);
          s((t = e.data.hook)) && (s(t.create) && t.create(ra, e), s(t.insert) && n.push(e));
        }
        function g(e) {
          var t;
          if (s((t = e.fnScopeId))) u.setStyleScope(e.elm, t);
          else
            for (var n = e; n; )
              s((t = n.context)) && s((t = t.$options._scopeId)) && u.setStyleScope(e.elm, t),
                (n = n.parent);
          s((t = Xt)) &&
            t !== e.context &&
            t !== e.fnContext &&
            s((t = t.$options._scopeId)) &&
            u.setStyleScope(e.elm, t);
        }
        function T(e, t, n, a, r, s) {
          for (; a <= r; ++a) d(n[a], s, e, t, !1, n, a);
        }
        function b(e) {
          var t,
            n,
            r = e.data;
          if (s(r))
            for (s((t = r.hook)) && s((t = t.destroy)) && t(e), t = 0; t < a.destroy.length; ++t)
              a.destroy[t](e);
          if (s((t = e.children))) for (n = 0; n < e.children.length; ++n) b(e.children[n]);
        }
        function w(e, t, n) {
          for (; t <= n; ++t) {
            var a = e[t];
            s(a) && (s(a.tag) ? (k(a), b(a)) : l(a.elm));
          }
        }
        function k(e, t) {
          if (s(t) || s(e.data)) {
            var n,
              r = a.remove.length + 1;
            for (
              s(t)
                ? (t.listeners += r)
                : (t = (function (e, t) {
                    function n() {
                      0 == --n.listeners && l(e);
                    }
                    return (n.listeners = t), n;
                  })(e.elm, r)),
                s((n = e.componentInstance)) && s((n = n._vnode)) && s(n.data) && k(n, t),
                n = 0;
              n < a.remove.length;
              ++n
            )
              a.remove[n](e, t);
            s((n = e.data.hook)) && s((n = n.remove)) ? n(e, t) : t();
          } else l(e.elm);
        }
        function A(e, t, n, a) {
          for (var r = n; r < a; r++) {
            var o = t[r];
            if (s(o) && oa(e, o)) return r;
          }
        }
        function _(e, t, n, i, p, l) {
          if (e !== t) {
            s(t.elm) && s(i) && (t = i[p] = be(t));
            var c = (t.elm = e.elm);
            if (o(e.isAsyncPlaceholder))
              s(t.asyncFactory.resolved) ? S(e.elm, t, n) : (t.isAsyncPlaceholder = !0);
            else if (
              o(t.isStatic) &&
              o(e.isStatic) &&
              t.key === e.key &&
              (o(t.isCloned) || o(t.isOnce))
            )
              t.componentInstance = e.componentInstance;
            else {
              var y,
                m = t.data;
              s(m) && s((y = m.hook)) && s((y = y.prepatch)) && y(e, t);
              var h = e.children,
                v = t.children;
              if (s(m) && f(t)) {
                for (y = 0; y < a.update.length; ++y) a.update[y](e, t);
                s((y = m.hook)) && s((y = y.update)) && y(e, t);
              }
              r(t.text)
                ? s(h) && s(v)
                  ? h !== v &&
                    (function (e, t, n, a, o) {
                      var i,
                        p,
                        l,
                        c = 0,
                        y = 0,
                        m = t.length - 1,
                        f = t[0],
                        h = t[m],
                        v = n.length - 1,
                        g = n[0],
                        b = n[v],
                        k = !o;
                      for (0; c <= m && y <= v; )
                        r(f)
                          ? (f = t[++c])
                          : r(h)
                          ? (h = t[--m])
                          : oa(f, g)
                          ? (_(f, g, a, n, y), (f = t[++c]), (g = n[++y]))
                          : oa(h, b)
                          ? (_(h, b, a, n, v), (h = t[--m]), (b = n[--v]))
                          : oa(f, b)
                          ? (_(f, b, a, n, v),
                            k && u.insertBefore(e, f.elm, u.nextSibling(h.elm)),
                            (f = t[++c]),
                            (b = n[--v]))
                          : oa(h, g)
                          ? (_(h, g, a, n, y),
                            k && u.insertBefore(e, h.elm, f.elm),
                            (h = t[--m]),
                            (g = n[++y]))
                          : (r(i) && (i = ia(t, c, m)),
                            r((p = s(g.key) ? i[g.key] : A(g, t, c, m)))
                              ? d(g, a, e, f.elm, !1, n, y)
                              : oa((l = t[p]), g)
                              ? (_(l, g, a, n, y),
                                (t[p] = void 0),
                                k && u.insertBefore(e, l.elm, f.elm))
                              : d(g, a, e, f.elm, !1, n, y),
                            (g = n[++y]));
                      c > m
                        ? T(e, r(n[v + 1]) ? null : n[v + 1].elm, n, y, v, a)
                        : y > v && w(t, c, m);
                    })(c, h, v, n, l)
                  : s(v)
                  ? (s(e.text) && u.setTextContent(c, ''), T(c, null, v, 0, v.length - 1, n))
                  : s(h)
                  ? w(h, 0, h.length - 1)
                  : s(e.text) && u.setTextContent(c, '')
                : e.text !== t.text && u.setTextContent(c, t.text),
                s(m) && s((y = m.hook)) && s((y = y.postpatch)) && y(e, t);
            }
          }
        }
        function x(e, t, n) {
          if (o(n) && s(e.parent)) e.parent.data.pendingInsert = t;
          else for (var a = 0; a < t.length; ++a) t[a].data.hook.insert(t[a]);
        }
        var O = h('attrs,class,staticClass,staticStyle,key');
        function S(e, t, n, a) {
          var r,
            i = t.tag,
            p = t.data,
            u = t.children;
          if (((a = a || (p && p.pre)), (t.elm = e), o(t.isComment) && s(t.asyncFactory)))
            return (t.isAsyncPlaceholder = !0), !0;
          if (
            s(p) &&
            (s((r = p.hook)) && s((r = r.init)) && r(t, !0), s((r = t.componentInstance)))
          )
            return c(t, n), !0;
          if (s(i)) {
            if (s(u))
              if (e.hasChildNodes())
                if (s((r = p)) && s((r = r.domProps)) && s((r = r.innerHTML))) {
                  if (r !== e.innerHTML) return !1;
                } else {
                  for (var l = !0, d = e.firstChild, y = 0; y < u.length; y++) {
                    if (!d || !S(d, u[y], n, a)) {
                      l = !1;
                      break;
                    }
                    d = d.nextSibling;
                  }
                  if (!l || d) return !1;
                }
              else m(t, u, n);
            if (s(p)) {
              var f = !1;
              for (var h in p)
                if (!O(h)) {
                  (f = !0), v(t, n);
                  break;
                }
              !f && p.class && st(p.class);
            }
          } else e.data !== t.text && (e.data = t.text);
          return !0;
        }
        return function (e, t, n, i) {
          if (!r(t)) {
            var p,
              l = !1,
              c = [];
            if (r(e)) (l = !0), d(t, c);
            else {
              var y = s(e.nodeType);
              if (!y && oa(e, t)) _(e, t, c, null, null, i);
              else {
                if (y) {
                  if (
                    (1 === e.nodeType &&
                      e.hasAttribute('data-server-rendered') &&
                      (e.removeAttribute('data-server-rendered'), (n = !0)),
                    o(n) && S(e, t, c))
                  )
                    return x(t, c, !0), e;
                  (p = e), (e = new he(u.tagName(p).toLowerCase(), {}, [], void 0, p));
                }
                var m = e.elm,
                  h = u.parentNode(m);
                if ((d(t, c, m._leaveCb ? null : h, u.nextSibling(m)), s(t.parent)))
                  for (var v = t.parent, g = f(t); v; ) {
                    for (var T = 0; T < a.destroy.length; ++T) a.destroy[T](v);
                    if (((v.elm = t.elm), g)) {
                      for (var k = 0; k < a.create.length; ++k) a.create[k](ra, v);
                      var A = v.data.hook.insert;
                      if (A.merged) for (var O = 1; O < A.fns.length; O++) A.fns[O]();
                    } else aa(v);
                    v = v.parent;
                  }
                s(h) ? w([e], 0, 0) : s(e.tag) && b(e);
              }
            }
            return x(t, c, l), t.elm;
          }
          s(e) && b(e);
        };
      })({
        nodeOps: ta,
        modules: [
          ga,
          Oa,
          nr,
          sr,
          hr,
          K
            ? {
                create: Lr,
                activate: Lr,
                remove: function (e, t) {
                  !0 !== e.data.show ? Rr(e, t) : t();
                },
              }
            : {},
        ].concat(ma),
      });
      Y &&
        document.addEventListener('selectionchange', function () {
          var e = document.activeElement;
          e && e.vmodel && Zr(e, 'input');
        });
      var Hr = {
        inserted: function (e, t, n, a) {
          'select' === n.tag
            ? (a.elm && !a.elm._vOptions
                ? ut(n, 'postpatch', function () {
                    Hr.componentUpdated(e, t, n);
                  })
                : Vr(e, t, n.context),
              (e._vOptions = [].map.call(e.options, Wr)))
            : ('textarea' === n.tag || Qn(e.type)) &&
              ((e._vModifiers = t.modifiers),
              t.modifiers.lazy ||
                (e.addEventListener('compositionstart', Kr),
                e.addEventListener('compositionend', Jr),
                e.addEventListener('change', Jr),
                Y && (e.vmodel = !0)));
        },
        componentUpdated: function (e, t, n) {
          if ('select' === n.tag) {
            Vr(e, t, n.context);
            var a = e._vOptions,
              r = (e._vOptions = [].map.call(e.options, Wr));
            if (
              r.some(function (e, t) {
                return !I(e, a[t]);
              })
            )
              (e.multiple
                ? t.value.some(function (e) {
                    return qr(e, r);
                  })
                : t.value !== t.oldValue && qr(t.value, r)) && Zr(e, 'change');
          }
        },
      };
      function Vr(e, t, n) {
        zr(e, t, n),
          (X || Q) &&
            setTimeout(function () {
              zr(e, t, n);
            }, 0);
      }
      function zr(e, t, n) {
        var a = t.value,
          r = e.multiple;
        if (!r || Array.isArray(a)) {
          for (var s, o, i = 0, p = e.options.length; i < p; i++)
            if (((o = e.options[i]), r))
              (s = N(a, Wr(o)) > -1), o.selected !== s && (o.selected = s);
            else if (I(Wr(o), a)) return void (e.selectedIndex !== i && (e.selectedIndex = i));
          r || (e.selectedIndex = -1);
        }
      }
      function qr(e, t) {
        return t.every(function (t) {
          return !I(t, e);
        });
      }
      function Wr(e) {
        return '_value' in e ? e._value : e.value;
      }
      function Kr(e) {
        e.target.composing = !0;
      }
      function Jr(e) {
        e.target.composing && ((e.target.composing = !1), Zr(e.target, 'input'));
      }
      function Zr(e, t) {
        var n = document.createEvent('HTMLEvents');
        n.initEvent(t, !0, !0), e.dispatchEvent(n);
      }
      function Gr(e) {
        return !e.componentInstance || (e.data && e.data.transition)
          ? e
          : Gr(e.componentInstance._vnode);
      }
      var Xr = {
          model: Hr,
          show: {
            bind: function (e, t, n) {
              var a = t.value,
                r = (n = Gr(n)).data && n.data.transition,
                s = (e.__vOriginalDisplay = 'none' === e.style.display ? '' : e.style.display);
              a && r
                ? ((n.data.show = !0),
                  Nr(n, function () {
                    e.style.display = s;
                  }))
                : (e.style.display = a ? s : 'none');
            },
            update: function (e, t, n) {
              var a = t.value;
              !a != !t.oldValue &&
                ((n = Gr(n)).data && n.data.transition
                  ? ((n.data.show = !0),
                    a
                      ? Nr(n, function () {
                          e.style.display = e.__vOriginalDisplay;
                        })
                      : Rr(n, function () {
                          e.style.display = 'none';
                        }))
                  : (e.style.display = a ? e.__vOriginalDisplay : 'none'));
            },
            unbind: function (e, t, n, a, r) {
              r || (e.style.display = e.__vOriginalDisplay);
            },
          },
        },
        Yr = {
          name: String,
          appear: Boolean,
          css: Boolean,
          mode: String,
          type: String,
          enterClass: String,
          leaveClass: String,
          enterToClass: String,
          leaveToClass: String,
          enterActiveClass: String,
          leaveActiveClass: String,
          appearClass: String,
          appearActiveClass: String,
          appearToClass: String,
          duration: [Number, String, Object],
        };
      function Qr(e) {
        var t = e && e.componentOptions;
        return t && t.Ctor.options.abstract ? Qr(Wt(t.children)) : e;
      }
      function es(e) {
        var t = {},
          n = e.$options;
        for (var a in n.propsData) t[a] = e[a];
        var r = n._parentListeners;
        for (var s in r) t[_(s)] = r[s];
        return t;
      }
      function ts(e, t) {
        if (/\d-keep-alive$/.test(t.tag))
          return e('keep-alive', { props: t.componentOptions.propsData });
      }
      var ns = function (e) {
          return e.tag || qt(e);
        },
        as = function (e) {
          return 'show' === e.name;
        },
        rs = {
          name: 'transition',
          props: Yr,
          abstract: !0,
          render: function (e) {
            var t = this,
              n = this.$slots.default;
            if (n && (n = n.filter(ns)).length) {
              0;
              var a = this.mode;
              0;
              var r = n[0];
              if (
                (function (e) {
                  for (; (e = e.parent); ) if (e.data.transition) return !0;
                })(this.$vnode)
              )
                return r;
              var s = Qr(r);
              if (!s) return r;
              if (this._leaving) return ts(e, r);
              var o = '__transition-' + this._uid + '-';
              s.key =
                null == s.key
                  ? s.isComment
                    ? o + 'comment'
                    : o + s.tag
                  : i(s.key)
                  ? 0 === String(s.key).indexOf(o)
                    ? s.key
                    : o + s.key
                  : s.key;
              var p = ((s.data || (s.data = {})).transition = es(this)),
                u = this._vnode,
                l = Qr(u);
              if (
                (s.data.directives && s.data.directives.some(as) && (s.data.show = !0),
                l &&
                  l.data &&
                  !(function (e, t) {
                    return t.key === e.key && t.tag === e.tag;
                  })(s, l) &&
                  !qt(l) &&
                  (!l.componentInstance || !l.componentInstance._vnode.isComment))
              ) {
                var d = (l.data.transition = M({}, p));
                if ('out-in' === a)
                  return (
                    (this._leaving = !0),
                    ut(d, 'afterLeave', function () {
                      (t._leaving = !1), t.$forceUpdate();
                    }),
                    ts(e, r)
                  );
                if ('in-out' === a) {
                  if (qt(s)) return u;
                  var c,
                    y = function () {
                      c();
                    };
                  ut(p, 'afterEnter', y),
                    ut(p, 'enterCancelled', y),
                    ut(d, 'delayLeave', function (e) {
                      c = e;
                    });
                }
              }
              return r;
            }
          },
        },
        ss = M({ tag: String, moveClass: String }, Yr);
      function os(e) {
        e.elm._moveCb && e.elm._moveCb(), e.elm._enterCb && e.elm._enterCb();
      }
      function is(e) {
        e.data.newPos = e.elm.getBoundingClientRect();
      }
      function ps(e) {
        var t = e.data.pos,
          n = e.data.newPos,
          a = t.left - n.left,
          r = t.top - n.top;
        if (a || r) {
          e.data.moved = !0;
          var s = e.elm.style;
          (s.transform = s.WebkitTransform = 'translate(' + a + 'px,' + r + 'px)'),
            (s.transitionDuration = '0s');
        }
      }
      delete ss.mode;
      var us = {
        Transition: rs,
        TransitionGroup: {
          props: ss,
          beforeMount: function () {
            var e = this,
              t = this._update;
            this._update = function (n, a) {
              var r = Yt(e);
              e.__patch__(e._vnode, e.kept, !1, !0), (e._vnode = e.kept), r(), t.call(e, n, a);
            };
          },
          render: function (e) {
            for (
              var t = this.tag || this.$vnode.data.tag || 'span',
                n = Object.create(null),
                a = (this.prevChildren = this.children),
                r = this.$slots.default || [],
                s = (this.children = []),
                o = es(this),
                i = 0;
              i < r.length;
              i++
            ) {
              var p = r[i];
              if (p.tag)
                if (null != p.key && 0 !== String(p.key).indexOf('__vlist'))
                  s.push(p), (n[p.key] = p), ((p.data || (p.data = {})).transition = o);
                else;
            }
            if (a) {
              for (var u = [], l = [], d = 0; d < a.length; d++) {
                var c = a[d];
                (c.data.transition = o),
                  (c.data.pos = c.elm.getBoundingClientRect()),
                  n[c.key] ? u.push(c) : l.push(c);
              }
              (this.kept = e(t, null, u)), (this.removed = l);
            }
            return e(t, null, s);
          },
          updated: function () {
            var e = this.prevChildren,
              t = this.moveClass || (this.name || 'v') + '-move';
            e.length &&
              this.hasMove(e[0].elm, t) &&
              (e.forEach(os),
              e.forEach(is),
              e.forEach(ps),
              (this._reflow = document.body.offsetHeight),
              e.forEach(function (e) {
                if (e.data.moved) {
                  var n = e.elm,
                    a = n.style;
                  Br(n, t),
                    (a.transform = a.WebkitTransform = a.transitionDuration = ''),
                    n.addEventListener(
                      _r,
                      (n._moveCb = function e(a) {
                        (a && a.target !== n) ||
                          (a && !/transform$/.test(a.propertyName)) ||
                          (n.removeEventListener(_r, e), (n._moveCb = null), Mr(n, t));
                      }),
                    );
                }
              }));
          },
          methods: {
            hasMove: function (e, t) {
              if (!kr) return !1;
              if (this._hasMove) return this._hasMove;
              var n = e.cloneNode();
              e._transitionClasses &&
                e._transitionClasses.forEach(function (e) {
                  Tr(n, e);
                }),
                gr(n, t),
                (n.style.display = 'none'),
                this.$el.appendChild(n);
              var a = Fr(n);
              return this.$el.removeChild(n), (this._hasMove = a.hasTransform);
            },
          },
        },
      };
      (xn.config.mustUseProp = In),
        (xn.config.isReservedTag = Gn),
        (xn.config.isReservedAttr = Fn),
        (xn.config.getTagNamespace = Xn),
        (xn.config.isUnknownElement = function (e) {
          if (!K) return !0;
          if (Gn(e)) return !1;
          if (((e = e.toLowerCase()), null != Yn[e])) return Yn[e];
          var t = document.createElement(e);
          return e.indexOf('-') > -1
            ? (Yn[e] =
                t.constructor === window.HTMLUnknownElement ||
                t.constructor === window.HTMLElement)
            : (Yn[e] = /HTMLUnknownElement/.test(t.toString()));
        }),
        M(xn.options.directives, Xr),
        M(xn.options.components, us),
        (xn.prototype.__patch__ = K ? Ur : P),
        (xn.prototype.$mount = function (e, t) {
          return (function (e, t, n) {
            var a;
            return (
              (e.$el = t),
              e.$options.render || (e.$options.render = ge),
              tn(e, 'beforeMount'),
              (a = function () {
                e._update(e._render(), n);
              }),
              new mn(
                e,
                a,
                P,
                {
                  before: function () {
                    e._isMounted && !e._isDestroyed && tn(e, 'beforeUpdate');
                  },
                },
                !0,
              ),
              (n = !1),
              null == e.$vnode && ((e._isMounted = !0), tn(e, 'mounted')),
              e
            );
          })(this, (e = e && K ? ea(e) : void 0), t);
        }),
        K &&
          setTimeout(function () {
            L.devtools && oe && oe.emit('init', xn);
          }, 0);
      var ls = /\{\{((?:.|\r?\n)+?)\}\}/g,
        ds = /[-.*+?^${}()|[\]\/\\]/g,
        cs = k(function (e) {
          var t = e[0].replace(ds, '\\$&'),
            n = e[1].replace(ds, '\\$&');
          return new RegExp(t + '((?:.|\\n)+?)' + n, 'g');
        });
      var ys = {
        staticKeys: ['staticClass'],
        transformNode: function (e, t) {
          t.warn;
          var n = Da(e, 'class');
          n && (e.staticClass = JSON.stringify(n));
          var a = ja(e, 'class', !1);
          a && (e.classBinding = a);
        },
        genData: function (e) {
          var t = '';
          return (
            e.staticClass && (t += 'staticClass:' + e.staticClass + ','),
            e.classBinding && (t += 'class:' + e.classBinding + ','),
            t
          );
        },
      };
      var ms,
        fs = {
          staticKeys: ['staticStyle'],
          transformNode: function (e, t) {
            t.warn;
            var n = Da(e, 'style');
            n && (e.staticStyle = JSON.stringify(or(n)));
            var a = ja(e, 'style', !1);
            a && (e.styleBinding = a);
          },
          genData: function (e) {
            var t = '';
            return (
              e.staticStyle && (t += 'staticStyle:' + e.staticStyle + ','),
              e.styleBinding && (t += 'style:(' + e.styleBinding + '),'),
              t
            );
          },
        },
        hs = function (e) {
          return ((ms = ms || document.createElement('div')).innerHTML = e), ms.textContent;
        },
        vs = h(
          'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr',
        ),
        gs = h('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'),
        Ts = h(
          'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,title,tr,track',
        ),
        bs = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
        ws =
          /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
        ks = '[a-zA-Z_][\\-\\.0-9_a-zA-Z' + U.source + ']*',
        As = '((?:' + ks + '\\:)?' + ks + ')',
        _s = new RegExp('^<' + As),
        xs = /^\s*(\/?)>/,
        Os = new RegExp('^<\\/' + As + '[^>]*>'),
        Ss = /^<!DOCTYPE [^>]+>/i,
        Cs = /^<!\--/,
        Bs = /^<!\[/,
        Ms = h('script,style,textarea', !0),
        $s = {},
        Ps = {
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&amp;': '&',
          '&#10;': '\n',
          '&#9;': '\t',
          '&#39;': "'",
        },
        Fs = /&(?:lt|gt|quot|amp|#39);/g,
        Es = /&(?:lt|gt|quot|amp|#39|#10|#9);/g,
        Is = h('pre,textarea', !0),
        Ns = function (e, t) {
          return e && Is(e) && '\n' === t[0];
        };
      function Rs(e, t) {
        var n = t ? Es : Fs;
        return e.replace(n, function (e) {
          return Ps[e];
        });
      }
      var js,
        Ds,
        Ls,
        Us,
        Hs,
        Vs,
        zs,
        qs,
        Ws = /^@|^v-on:/,
        Ks = /^v-|^@|^:|^#/,
        Js = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
        Zs = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/,
        Gs = /^\(|\)$/g,
        Xs = /^\[.*\]$/,
        Ys = /:(.*)$/,
        Qs = /^:|^\.|^v-bind:/,
        eo = /\.[^.\]]+(?=[^\]]*$)/g,
        to = /^v-slot(:|$)|^#/,
        no = /[\r\n]/,
        ao = /\s+/g,
        ro = k(hs);
      function so(e, t, n) {
        return {
          type: 1,
          tag: e,
          attrsList: t,
          attrsMap: yo(t),
          rawAttrsMap: {},
          parent: n,
          children: [],
        };
      }
      function oo(e, t) {
        (js = t.warn || Ma),
          (Vs = t.isPreTag || F),
          (zs = t.mustUseProp || F),
          (qs = t.getTagNamespace || F);
        var n = t.isReservedTag || F;
        (function (e) {
          return !!e.component || !n(e.tag);
        },
          (Ls = $a(t.modules, 'transformNode')),
          (Us = $a(t.modules, 'preTransformNode')),
          (Hs = $a(t.modules, 'postTransformNode')),
          (Ds = t.delimiters));
        var a,
          r,
          s = [],
          o = !1 !== t.preserveWhitespace,
          i = t.whitespace,
          p = !1,
          u = !1;
        function l(e) {
          if (
            (d(e),
            p || e.processed || (e = io(e, t)),
            s.length ||
              e === a ||
              (a.if && (e.elseif || e.else) && uo(a, { exp: e.elseif, block: e })),
            r && !e.forbidden)
          )
            if (e.elseif || e.else)
              (o = e),
                (i = (function (e) {
                  for (var t = e.length; t--; ) {
                    if (1 === e[t].type) return e[t];
                    e.pop();
                  }
                })(r.children)) &&
                  i.if &&
                  uo(i, { exp: o.elseif, block: o });
            else {
              if (e.slotScope) {
                var n = e.slotTarget || '"default"';
                (r.scopedSlots || (r.scopedSlots = {}))[n] = e;
              }
              r.children.push(e), (e.parent = r);
            }
          var o, i;
          (e.children = e.children.filter(function (e) {
            return !e.slotScope;
          })),
            d(e),
            e.pre && (p = !1),
            Vs(e.tag) && (u = !1);
          for (var l = 0; l < Hs.length; l++) Hs[l](e, t);
        }
        function d(e) {
          if (!u)
            for (
              var t;
              (t = e.children[e.children.length - 1]) && 3 === t.type && ' ' === t.text;

            )
              e.children.pop();
        }
        return (
          (function (e, t) {
            for (
              var n,
                a,
                r = [],
                s = t.expectHTML,
                o = t.isUnaryTag || F,
                i = t.canBeLeftOpenTag || F,
                p = 0;
              e;

            ) {
              if (((n = e), a && Ms(a))) {
                var u = 0,
                  l = a.toLowerCase(),
                  d = $s[l] || ($s[l] = new RegExp('([\\s\\S]*?)(</' + l + '[^>]*>)', 'i')),
                  c = e.replace(d, function (e, n, a) {
                    return (
                      (u = a.length),
                      Ms(l) ||
                        'noscript' === l ||
                        (n = n
                          .replace(/<!\--([\s\S]*?)-->/g, '$1')
                          .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')),
                      Ns(l, n) && (n = n.slice(1)),
                      t.chars && t.chars(n),
                      ''
                    );
                  });
                (p += e.length - c.length), (e = c), O(l, p - u, p);
              } else {
                var y = e.indexOf('<');
                if (0 === y) {
                  if (Cs.test(e)) {
                    var m = e.indexOf('--\x3e');
                    if (m >= 0) {
                      t.shouldKeepComment && t.comment(e.substring(4, m), p, p + m + 3), A(m + 3);
                      continue;
                    }
                  }
                  if (Bs.test(e)) {
                    var f = e.indexOf(']>');
                    if (f >= 0) {
                      A(f + 2);
                      continue;
                    }
                  }
                  var h = e.match(Ss);
                  if (h) {
                    A(h[0].length);
                    continue;
                  }
                  var v = e.match(Os);
                  if (v) {
                    var g = p;
                    A(v[0].length), O(v[1], g, p);
                    continue;
                  }
                  var T = _();
                  if (T) {
                    x(T), Ns(T.tagName, e) && A(1);
                    continue;
                  }
                }
                var b = void 0,
                  w = void 0,
                  k = void 0;
                if (y >= 0) {
                  for (
                    w = e.slice(y);
                    !(
                      Os.test(w) ||
                      _s.test(w) ||
                      Cs.test(w) ||
                      Bs.test(w) ||
                      (k = w.indexOf('<', 1)) < 0
                    );

                  )
                    (y += k), (w = e.slice(y));
                  b = e.substring(0, y);
                }
                y < 0 && (b = e), b && A(b.length), t.chars && b && t.chars(b, p - b.length, p);
              }
              if (e === n) {
                t.chars && t.chars(e);
                break;
              }
            }
            function A(t) {
              (p += t), (e = e.substring(t));
            }
            function _() {
              var t = e.match(_s);
              if (t) {
                var n,
                  a,
                  r = { tagName: t[1], attrs: [], start: p };
                for (A(t[0].length); !(n = e.match(xs)) && (a = e.match(ws) || e.match(bs)); )
                  (a.start = p), A(a[0].length), (a.end = p), r.attrs.push(a);
                if (n) return (r.unarySlash = n[1]), A(n[0].length), (r.end = p), r;
              }
            }
            function x(e) {
              var n = e.tagName,
                p = e.unarySlash;
              s && ('p' === a && Ts(n) && O(a), i(n) && a === n && O(n));
              for (var u = o(n) || !!p, l = e.attrs.length, d = new Array(l), c = 0; c < l; c++) {
                var y = e.attrs[c],
                  m = y[3] || y[4] || y[5] || '',
                  f =
                    'a' === n && 'href' === y[1]
                      ? t.shouldDecodeNewlinesForHref
                      : t.shouldDecodeNewlines;
                d[c] = { name: y[1], value: Rs(m, f) };
              }
              u ||
                (r.push({
                  tag: n,
                  lowerCasedTag: n.toLowerCase(),
                  attrs: d,
                  start: e.start,
                  end: e.end,
                }),
                (a = n)),
                t.start && t.start(n, d, u, e.start, e.end);
            }
            function O(e, n, s) {
              var o, i;
              if ((null == n && (n = p), null == s && (s = p), e))
                for (
                  i = e.toLowerCase(), o = r.length - 1;
                  o >= 0 && r[o].lowerCasedTag !== i;
                  o--
                );
              else o = 0;
              if (o >= 0) {
                for (var u = r.length - 1; u >= o; u--) t.end && t.end(r[u].tag, n, s);
                (r.length = o), (a = o && r[o - 1].tag);
              } else
                'br' === i
                  ? t.start && t.start(e, [], !0, n, s)
                  : 'p' === i && (t.start && t.start(e, [], !1, n, s), t.end && t.end(e, n, s));
            }
            O();
          })(e, {
            warn: js,
            expectHTML: t.expectHTML,
            isUnaryTag: t.isUnaryTag,
            canBeLeftOpenTag: t.canBeLeftOpenTag,
            shouldDecodeNewlines: t.shouldDecodeNewlines,
            shouldDecodeNewlinesForHref: t.shouldDecodeNewlinesForHref,
            shouldKeepComment: t.comments,
            outputSourceRange: t.outputSourceRange,
            start: function (e, n, o, i, d) {
              var c = (r && r.ns) || qs(e);
              X &&
                'svg' === c &&
                (n = (function (e) {
                  for (var t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    mo.test(a.name) || ((a.name = a.name.replace(fo, '')), t.push(a));
                  }
                  return t;
                })(n));
              var y,
                m = so(e, n, r);
              c && (m.ns = c),
                ('style' !== (y = m).tag &&
                  ('script' !== y.tag ||
                    (y.attrsMap.type && 'text/javascript' !== y.attrsMap.type))) ||
                  se() ||
                  (m.forbidden = !0);
              for (var f = 0; f < Us.length; f++) m = Us[f](m, t) || m;
              p ||
                (!(function (e) {
                  null != Da(e, 'v-pre') && (e.pre = !0);
                })(m),
                m.pre && (p = !0)),
                Vs(m.tag) && (u = !0),
                p
                  ? (function (e) {
                      var t = e.attrsList,
                        n = t.length;
                      if (n)
                        for (var a = (e.attrs = new Array(n)), r = 0; r < n; r++)
                          (a[r] = { name: t[r].name, value: JSON.stringify(t[r].value) }),
                            null != t[r].start &&
                              ((a[r].start = t[r].start), (a[r].end = t[r].end));
                      else e.pre || (e.plain = !0);
                    })(m)
                  : m.processed ||
                    (po(m),
                    (function (e) {
                      var t = Da(e, 'v-if');
                      if (t) (e.if = t), uo(e, { exp: t, block: e });
                      else {
                        null != Da(e, 'v-else') && (e.else = !0);
                        var n = Da(e, 'v-else-if');
                        n && (e.elseif = n);
                      }
                    })(m),
                    (function (e) {
                      null != Da(e, 'v-once') && (e.once = !0);
                    })(m)),
                a || (a = m),
                o ? l(m) : ((r = m), s.push(m));
            },
            end: function (e, t, n) {
              var a = s[s.length - 1];
              (s.length -= 1), (r = s[s.length - 1]), l(a);
            },
            chars: function (e, t, n) {
              if (r && (!X || 'textarea' !== r.tag || r.attrsMap.placeholder !== e)) {
                var a,
                  s,
                  l,
                  d = r.children;
                if (
                  (e =
                    u || e.trim()
                      ? 'script' === (a = r).tag || 'style' === a.tag
                        ? e
                        : ro(e)
                      : d.length
                      ? i
                        ? 'condense' === i && no.test(e)
                          ? ''
                          : ' '
                        : o
                        ? ' '
                        : ''
                      : '')
                )
                  u || 'condense' !== i || (e = e.replace(ao, ' ')),
                    !p &&
                    ' ' !== e &&
                    (s = (function (e, t) {
                      var n = t ? cs(t) : ls;
                      if (n.test(e)) {
                        for (
                          var a, r, s, o = [], i = [], p = (n.lastIndex = 0);
                          (a = n.exec(e));

                        ) {
                          (r = a.index) > p &&
                            (i.push((s = e.slice(p, r))), o.push(JSON.stringify(s)));
                          var u = Ca(a[1].trim());
                          o.push('_s(' + u + ')'),
                            i.push({ '@binding': u }),
                            (p = r + a[0].length);
                        }
                        return (
                          p < e.length && (i.push((s = e.slice(p))), o.push(JSON.stringify(s))),
                          { expression: o.join('+'), tokens: i }
                        );
                      }
                    })(e, Ds))
                      ? (l = { type: 2, expression: s.expression, tokens: s.tokens, text: e })
                      : (' ' === e && d.length && ' ' === d[d.length - 1].text) ||
                        (l = { type: 3, text: e }),
                    l && d.push(l);
              }
            },
            comment: function (e, t, n) {
              if (r) {
                var a = { type: 3, text: e, isComment: !0 };
                0, r.children.push(a);
              }
            },
          }),
          a
        );
      }
      function io(e, t) {
        var n;
        !(function (e) {
          var t = ja(e, 'key');
          if (t) {
            e.key = t;
          }
        })(e),
          (e.plain = !e.key && !e.scopedSlots && !e.attrsList.length),
          (function (e) {
            var t = ja(e, 'ref');
            t &&
              ((e.ref = t),
              (e.refInFor = (function (e) {
                var t = e;
                for (; t; ) {
                  if (void 0 !== t.for) return !0;
                  t = t.parent;
                }
                return !1;
              })(e)));
          })(e),
          (function (e) {
            var t;
            'template' === e.tag
              ? ((t = Da(e, 'scope')), (e.slotScope = t || Da(e, 'slot-scope')))
              : (t = Da(e, 'slot-scope')) && (e.slotScope = t);
            var n = ja(e, 'slot');
            n &&
              ((e.slotTarget = '""' === n ? '"default"' : n),
              (e.slotTargetDynamic = !(!e.attrsMap[':slot'] && !e.attrsMap['v-bind:slot'])),
              'template' === e.tag ||
                e.slotScope ||
                Fa(
                  e,
                  'slot',
                  n,
                  (function (e, t) {
                    return (
                      e.rawAttrsMap[':' + t] || e.rawAttrsMap['v-bind:' + t] || e.rawAttrsMap[t]
                    );
                  })(e, 'slot'),
                ));
            if ('template' === e.tag) {
              var a = La(e, to);
              if (a) {
                0;
                var r = lo(a),
                  s = r.name,
                  o = r.dynamic;
                (e.slotTarget = s),
                  (e.slotTargetDynamic = o),
                  (e.slotScope = a.value || '_empty_');
              }
            } else {
              var i = La(e, to);
              if (i) {
                0;
                var p = e.scopedSlots || (e.scopedSlots = {}),
                  u = lo(i),
                  l = u.name,
                  d = u.dynamic,
                  c = (p[l] = so('template', [], e));
                (c.slotTarget = l),
                  (c.slotTargetDynamic = d),
                  (c.children = e.children.filter(function (e) {
                    if (!e.slotScope) return (e.parent = c), !0;
                  })),
                  (c.slotScope = i.value || '_empty_'),
                  (e.children = []),
                  (e.plain = !1);
              }
            }
          })(e),
          'slot' === (n = e).tag && (n.slotName = ja(n, 'name')),
          (function (e) {
            var t;
            (t = ja(e, 'is')) && (e.component = t);
            null != Da(e, 'inline-template') && (e.inlineTemplate = !0);
          })(e);
        for (var a = 0; a < Ls.length; a++) e = Ls[a](e, t) || e;
        return (
          (function (e) {
            var t,
              n,
              a,
              r,
              s,
              o,
              i,
              p,
              u = e.attrsList;
            for (t = 0, n = u.length; t < n; t++) {
              if (((a = r = u[t].name), (s = u[t].value), Ks.test(a)))
                if (
                  ((e.hasBindings = !0),
                  (o = co(a.replace(Ks, ''))) && (a = a.replace(eo, '')),
                  Qs.test(a))
                )
                  (a = a.replace(Qs, '')),
                    (s = Ca(s)),
                    (p = Xs.test(a)) && (a = a.slice(1, -1)),
                    o &&
                      (o.prop && !p && 'innerHtml' === (a = _(a)) && (a = 'innerHTML'),
                      o.camel && !p && (a = _(a)),
                      o.sync &&
                        ((i = Va(s, '$event')),
                        p
                          ? Ra(e, '"update:"+(' + a + ')', i, null, !1, 0, u[t], !0)
                          : (Ra(e, 'update:' + _(a), i, null, !1, 0, u[t]),
                            S(a) !== _(a) && Ra(e, 'update:' + S(a), i, null, !1, 0, u[t])))),
                    (o && o.prop) || (!e.component && zs(e.tag, e.attrsMap.type, a))
                      ? Pa(e, a, s, u[t], p)
                      : Fa(e, a, s, u[t], p);
                else if (Ws.test(a))
                  (a = a.replace(Ws, '')),
                    (p = Xs.test(a)) && (a = a.slice(1, -1)),
                    Ra(e, a, s, o, !1, 0, u[t], p);
                else {
                  var l = (a = a.replace(Ks, '')).match(Ys),
                    d = l && l[1];
                  (p = !1),
                    d &&
                      ((a = a.slice(0, -(d.length + 1))),
                      Xs.test(d) && ((d = d.slice(1, -1)), (p = !0))),
                    Ia(e, a, r, s, d, p, o, u[t]);
                }
              else
                Fa(e, a, JSON.stringify(s), u[t]),
                  !e.component &&
                    'muted' === a &&
                    zs(e.tag, e.attrsMap.type, a) &&
                    Pa(e, a, 'true', u[t]);
            }
          })(e),
          e
        );
      }
      function po(e) {
        var t;
        if ((t = Da(e, 'v-for'))) {
          var n = (function (e) {
            var t = e.match(Js);
            if (!t) return;
            var n = {};
            n.for = t[2].trim();
            var a = t[1].trim().replace(Gs, ''),
              r = a.match(Zs);
            r
              ? ((n.alias = a.replace(Zs, '').trim()),
                (n.iterator1 = r[1].trim()),
                r[2] && (n.iterator2 = r[2].trim()))
              : (n.alias = a);
            return n;
          })(t);
          n && M(e, n);
        }
      }
      function uo(e, t) {
        e.ifConditions || (e.ifConditions = []), e.ifConditions.push(t);
      }
      function lo(e) {
        var t = e.name.replace(to, '');
        return (
          t || ('#' !== e.name[0] && (t = 'default')),
          Xs.test(t) ? { name: t.slice(1, -1), dynamic: !0 } : { name: '"' + t + '"', dynamic: !1 }
        );
      }
      function co(e) {
        var t = e.match(eo);
        if (t) {
          var n = {};
          return (
            t.forEach(function (e) {
              n[e.slice(1)] = !0;
            }),
            n
          );
        }
      }
      function yo(e) {
        for (var t = {}, n = 0, a = e.length; n < a; n++) t[e[n].name] = e[n].value;
        return t;
      }
      var mo = /^xmlns:NS\d+/,
        fo = /^NS\d+:/;
      function ho(e) {
        return so(e.tag, e.attrsList.slice(), e.parent);
      }
      var vo = [
        ys,
        fs,
        {
          preTransformNode: function (e, t) {
            if ('input' === e.tag) {
              var n,
                a = e.attrsMap;
              if (!a['v-model']) return;
              if (
                ((a[':type'] || a['v-bind:type']) && (n = ja(e, 'type')),
                a.type || n || !a['v-bind'] || (n = '(' + a['v-bind'] + ').type'),
                n)
              ) {
                var r = Da(e, 'v-if', !0),
                  s = r ? '&&(' + r + ')' : '',
                  o = null != Da(e, 'v-else', !0),
                  i = Da(e, 'v-else-if', !0),
                  p = ho(e);
                po(p),
                  Ea(p, 'type', 'checkbox'),
                  io(p, t),
                  (p.processed = !0),
                  (p.if = '(' + n + ")==='checkbox'" + s),
                  uo(p, { exp: p.if, block: p });
                var u = ho(e);
                Da(u, 'v-for', !0),
                  Ea(u, 'type', 'radio'),
                  io(u, t),
                  uo(p, { exp: '(' + n + ")==='radio'" + s, block: u });
                var l = ho(e);
                return (
                  Da(l, 'v-for', !0),
                  Ea(l, ':type', n),
                  io(l, t),
                  uo(p, { exp: r, block: l }),
                  o ? (p.else = !0) : i && (p.elseif = i),
                  p
                );
              }
            }
          },
        },
      ];
      var go,
        To,
        bo = {
          expectHTML: !0,
          modules: vo,
          directives: {
            model: function (e, t, n) {
              n;
              var a = t.value,
                r = t.modifiers,
                s = e.tag,
                o = e.attrsMap.type;
              if (e.component) return Ha(e, a, r), !1;
              if ('select' === s)
                !(function (e, t, n) {
                  var a =
                    'var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return ' +
                    (n && n.number ? '_n(val)' : 'val') +
                    '});';
                  (a =
                    a + ' ' + Va(t, '$event.target.multiple ? $$selectedVal : $$selectedVal[0]')),
                    Ra(e, 'change', a, null, !0);
                })(e, a, r);
              else if ('input' === s && 'checkbox' === o)
                !(function (e, t, n) {
                  var a = n && n.number,
                    r = ja(e, 'value') || 'null',
                    s = ja(e, 'true-value') || 'true',
                    o = ja(e, 'false-value') || 'false';
                  Pa(
                    e,
                    'checked',
                    'Array.isArray(' +
                      t +
                      ')?_i(' +
                      t +
                      ',' +
                      r +
                      ')>-1' +
                      ('true' === s ? ':(' + t + ')' : ':_q(' + t + ',' + s + ')'),
                  ),
                    Ra(
                      e,
                      'change',
                      'var $$a=' +
                        t +
                        ',$$el=$event.target,$$c=$$el.checked?(' +
                        s +
                        '):(' +
                        o +
                        ');if(Array.isArray($$a)){var $$v=' +
                        (a ? '_n(' + r + ')' : r) +
                        ',$$i=_i($$a,$$v);if($$el.checked){$$i<0&&(' +
                        Va(t, '$$a.concat([$$v])') +
                        ')}else{$$i>-1&&(' +
                        Va(t, '$$a.slice(0,$$i).concat($$a.slice($$i+1))') +
                        ')}}else{' +
                        Va(t, '$$c') +
                        '}',
                      null,
                      !0,
                    );
                })(e, a, r);
              else if ('input' === s && 'radio' === o)
                !(function (e, t, n) {
                  var a = n && n.number,
                    r = ja(e, 'value') || 'null';
                  Pa(e, 'checked', '_q(' + t + ',' + (r = a ? '_n(' + r + ')' : r) + ')'),
                    Ra(e, 'change', Va(t, r), null, !0);
                })(e, a, r);
              else if ('input' === s || 'textarea' === s)
                !(function (e, t, n) {
                  var a = e.attrsMap.type;
                  0;
                  var r = n || {},
                    s = r.lazy,
                    o = r.number,
                    i = r.trim,
                    p = !s && 'range' !== a,
                    u = s ? 'change' : 'range' === a ? '__r' : 'input',
                    l = '$event.target.value';
                  i && (l = '$event.target.value.trim()');
                  o && (l = '_n(' + l + ')');
                  var d = Va(t, l);
                  p && (d = 'if($event.target.composing)return;' + d);
                  Pa(e, 'value', '(' + t + ')'),
                    Ra(e, u, d, null, !0),
                    (i || o) && Ra(e, 'blur', '$forceUpdate()');
                })(e, a, r);
              else {
                if (!L.isReservedTag(s)) return Ha(e, a, r), !1;
              }
              return !0;
            },
            text: function (e, t) {
              t.value && Pa(e, 'textContent', '_s(' + t.value + ')', t);
            },
            html: function (e, t) {
              t.value && Pa(e, 'innerHTML', '_s(' + t.value + ')', t);
            },
          },
          isPreTag: function (e) {
            return 'pre' === e;
          },
          isUnaryTag: vs,
          mustUseProp: In,
          canBeLeftOpenTag: gs,
          isReservedTag: Gn,
          getTagNamespace: Xn,
          staticKeys: (function (e) {
            return e
              .reduce(function (e, t) {
                return e.concat(t.staticKeys || []);
              }, [])
              .join(',');
          })(vo),
        },
        wo = k(function (e) {
          return h(
            'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
              (e ? ',' + e : ''),
          );
        });
      function ko(e, t) {
        e &&
          ((go = wo(t.staticKeys || '')),
          (To = t.isReservedTag || F),
          (function e(t) {
            if (
              ((t.static = (function (e) {
                if (2 === e.type) return !1;
                if (3 === e.type) return !0;
                return !(
                  !e.pre &&
                  (e.hasBindings ||
                    e.if ||
                    e.for ||
                    v(e.tag) ||
                    !To(e.tag) ||
                    (function (e) {
                      for (; e.parent; ) {
                        if ('template' !== (e = e.parent).tag) return !1;
                        if (e.for) return !0;
                      }
                      return !1;
                    })(e) ||
                    !Object.keys(e).every(go))
                );
              })(t)),
              1 === t.type)
            ) {
              if (!To(t.tag) && 'slot' !== t.tag && null == t.attrsMap['inline-template']) return;
              for (var n = 0, a = t.children.length; n < a; n++) {
                var r = t.children[n];
                e(r), r.static || (t.static = !1);
              }
              if (t.ifConditions)
                for (var s = 1, o = t.ifConditions.length; s < o; s++) {
                  var i = t.ifConditions[s].block;
                  e(i), i.static || (t.static = !1);
                }
            }
          })(e),
          (function e(t, n) {
            if (1 === t.type) {
              if (
                ((t.static || t.once) && (t.staticInFor = n),
                t.static &&
                  t.children.length &&
                  (1 !== t.children.length || 3 !== t.children[0].type))
              )
                return void (t.staticRoot = !0);
              if (((t.staticRoot = !1), t.children))
                for (var a = 0, r = t.children.length; a < r; a++) e(t.children[a], n || !!t.for);
              if (t.ifConditions)
                for (var s = 1, o = t.ifConditions.length; s < o; s++)
                  e(t.ifConditions[s].block, n);
            }
          })(e, !1));
      }
      var Ao = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/,
        _o = /\([^)]*?\);*$/,
        xo =
          /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/,
        Oo = {
          esc: 27,
          tab: 9,
          enter: 13,
          space: 32,
          up: 38,
          left: 37,
          right: 39,
          down: 40,
          delete: [8, 46],
        },
        So = {
          esc: ['Esc', 'Escape'],
          tab: 'Tab',
          enter: 'Enter',
          space: [' ', 'Spacebar'],
          up: ['Up', 'ArrowUp'],
          left: ['Left', 'ArrowLeft'],
          right: ['Right', 'ArrowRight'],
          down: ['Down', 'ArrowDown'],
          delete: ['Backspace', 'Delete', 'Del'],
        },
        Co = function (e) {
          return 'if(' + e + ')return null;';
        },
        Bo = {
          stop: '$event.stopPropagation();',
          prevent: '$event.preventDefault();',
          self: Co('$event.target !== $event.currentTarget'),
          ctrl: Co('!$event.ctrlKey'),
          shift: Co('!$event.shiftKey'),
          alt: Co('!$event.altKey'),
          meta: Co('!$event.metaKey'),
          left: Co("'button' in $event && $event.button !== 0"),
          middle: Co("'button' in $event && $event.button !== 1"),
          right: Co("'button' in $event && $event.button !== 2"),
        };
      function Mo(e, t) {
        var n = t ? 'nativeOn:' : 'on:',
          a = '',
          r = '';
        for (var s in e) {
          var o = $o(e[s]);
          e[s] && e[s].dynamic ? (r += s + ',' + o + ',') : (a += '"' + s + '":' + o + ',');
        }
        return (
          (a = '{' + a.slice(0, -1) + '}'),
          r ? n + '_d(' + a + ',[' + r.slice(0, -1) + '])' : n + a
        );
      }
      function $o(e) {
        if (!e) return 'function(){}';
        if (Array.isArray(e))
          return (
            '[' +
            e
              .map(function (e) {
                return $o(e);
              })
              .join(',') +
            ']'
          );
        var t = xo.test(e.value),
          n = Ao.test(e.value),
          a = xo.test(e.value.replace(_o, ''));
        if (e.modifiers) {
          var r = '',
            s = '',
            o = [];
          for (var i in e.modifiers)
            if (Bo[i]) (s += Bo[i]), Oo[i] && o.push(i);
            else if ('exact' === i) {
              var p = e.modifiers;
              s += Co(
                ['ctrl', 'shift', 'alt', 'meta']
                  .filter(function (e) {
                    return !p[e];
                  })
                  .map(function (e) {
                    return '$event.' + e + 'Key';
                  })
                  .join('||'),
              );
            } else o.push(i);
          return (
            o.length &&
              (r += (function (e) {
                return "if(!$event.type.indexOf('key')&&" + e.map(Po).join('&&') + ')return null;';
              })(o)),
            s && (r += s),
            'function($event){' +
              r +
              (t
                ? 'return ' + e.value + '($event)'
                : n
                ? 'return (' + e.value + ')($event)'
                : a
                ? 'return ' + e.value
                : e.value) +
              '}'
          );
        }
        return t || n ? e.value : 'function($event){' + (a ? 'return ' + e.value : e.value) + '}';
      }
      function Po(e) {
        var t = parseInt(e, 10);
        if (t) return '$event.keyCode!==' + t;
        var n = Oo[e],
          a = So[e];
        return (
          '_k($event.keyCode,' +
          JSON.stringify(e) +
          ',' +
          JSON.stringify(n) +
          ',$event.key,' +
          JSON.stringify(a) +
          ')'
        );
      }
      var Fo = {
          on: function (e, t) {
            e.wrapListeners = function (e) {
              return '_g(' + e + ',' + t.value + ')';
            };
          },
          bind: function (e, t) {
            e.wrapData = function (n) {
              return (
                '_b(' +
                n +
                ",'" +
                e.tag +
                "'," +
                t.value +
                ',' +
                (t.modifiers && t.modifiers.prop ? 'true' : 'false') +
                (t.modifiers && t.modifiers.sync ? ',true' : '') +
                ')'
              );
            };
          },
          cloak: P,
        },
        Eo = function (e) {
          (this.options = e),
            (this.warn = e.warn || Ma),
            (this.transforms = $a(e.modules, 'transformCode')),
            (this.dataGenFns = $a(e.modules, 'genData')),
            (this.directives = M(M({}, Fo), e.directives));
          var t = e.isReservedTag || F;
          (this.maybeComponent = function (e) {
            return !!e.component || !t(e.tag);
          }),
            (this.onceId = 0),
            (this.staticRenderFns = []),
            (this.pre = !1);
        };
      function Io(e, t) {
        var n = new Eo(t);
        return {
          render: 'with(this){return ' + (e ? No(e, n) : '_c("div")') + '}',
          staticRenderFns: n.staticRenderFns,
        };
      }
      function No(e, t) {
        if ((e.parent && (e.pre = e.pre || e.parent.pre), e.staticRoot && !e.staticProcessed))
          return Ro(e, t);
        if (e.once && !e.onceProcessed) return jo(e, t);
        if (e.for && !e.forProcessed) return Lo(e, t);
        if (e.if && !e.ifProcessed) return Do(e, t);
        if ('template' !== e.tag || e.slotTarget || t.pre) {
          if ('slot' === e.tag)
            return (function (e, t) {
              var n = e.slotName || '"default"',
                a = zo(e, t),
                r = '_t(' + n + (a ? ',' + a : ''),
                s =
                  e.attrs || e.dynamicAttrs
                    ? Ko(
                        (e.attrs || []).concat(e.dynamicAttrs || []).map(function (e) {
                          return { name: _(e.name), value: e.value, dynamic: e.dynamic };
                        }),
                      )
                    : null,
                o = e.attrsMap['v-bind'];
              (!s && !o) || a || (r += ',null');
              s && (r += ',' + s);
              o && (r += (s ? '' : ',null') + ',' + o);
              return r + ')';
            })(e, t);
          var n;
          if (e.component)
            n = (function (e, t, n) {
              var a = t.inlineTemplate ? null : zo(t, n, !0);
              return '_c(' + e + ',' + Uo(t, n) + (a ? ',' + a : '') + ')';
            })(e.component, e, t);
          else {
            var a;
            (!e.plain || (e.pre && t.maybeComponent(e))) && (a = Uo(e, t));
            var r = e.inlineTemplate ? null : zo(e, t, !0);
            n = "_c('" + e.tag + "'" + (a ? ',' + a : '') + (r ? ',' + r : '') + ')';
          }
          for (var s = 0; s < t.transforms.length; s++) n = t.transforms[s](e, n);
          return n;
        }
        return zo(e, t) || 'void 0';
      }
      function Ro(e, t) {
        e.staticProcessed = !0;
        var n = t.pre;
        return (
          e.pre && (t.pre = e.pre),
          t.staticRenderFns.push('with(this){return ' + No(e, t) + '}'),
          (t.pre = n),
          '_m(' + (t.staticRenderFns.length - 1) + (e.staticInFor ? ',true' : '') + ')'
        );
      }
      function jo(e, t) {
        if (((e.onceProcessed = !0), e.if && !e.ifProcessed)) return Do(e, t);
        if (e.staticInFor) {
          for (var n = '', a = e.parent; a; ) {
            if (a.for) {
              n = a.key;
              break;
            }
            a = a.parent;
          }
          return n ? '_o(' + No(e, t) + ',' + t.onceId++ + ',' + n + ')' : No(e, t);
        }
        return Ro(e, t);
      }
      function Do(e, t, n, a) {
        return (
          (e.ifProcessed = !0),
          (function e(t, n, a, r) {
            if (!t.length) return r || '_e()';
            var s = t.shift();
            return s.exp ? '(' + s.exp + ')?' + o(s.block) + ':' + e(t, n, a, r) : '' + o(s.block);
            function o(e) {
              return a ? a(e, n) : e.once ? jo(e, n) : No(e, n);
            }
          })(e.ifConditions.slice(), t, n, a)
        );
      }
      function Lo(e, t, n, a) {
        var r = e.for,
          s = e.alias,
          o = e.iterator1 ? ',' + e.iterator1 : '',
          i = e.iterator2 ? ',' + e.iterator2 : '';
        return (
          (e.forProcessed = !0),
          (a || '_l') + '((' + r + '),function(' + s + o + i + '){return ' + (n || No)(e, t) + '})'
        );
      }
      function Uo(e, t) {
        var n = '{',
          a = (function (e, t) {
            var n = e.directives;
            if (!n) return;
            var a,
              r,
              s,
              o,
              i = 'directives:[',
              p = !1;
            for (a = 0, r = n.length; a < r; a++) {
              (s = n[a]), (o = !0);
              var u = t.directives[s.name];
              u && (o = !!u(e, s, t.warn)),
                o &&
                  ((p = !0),
                  (i +=
                    '{name:"' +
                    s.name +
                    '",rawName:"' +
                    s.rawName +
                    '"' +
                    (s.value
                      ? ',value:(' + s.value + '),expression:' + JSON.stringify(s.value)
                      : '') +
                    (s.arg ? ',arg:' + (s.isDynamicArg ? s.arg : '"' + s.arg + '"') : '') +
                    (s.modifiers ? ',modifiers:' + JSON.stringify(s.modifiers) : '') +
                    '},'));
            }
            if (p) return i.slice(0, -1) + ']';
          })(e, t);
        a && (n += a + ','),
          e.key && (n += 'key:' + e.key + ','),
          e.ref && (n += 'ref:' + e.ref + ','),
          e.refInFor && (n += 'refInFor:true,'),
          e.pre && (n += 'pre:true,'),
          e.component && (n += 'tag:"' + e.tag + '",');
        for (var r = 0; r < t.dataGenFns.length; r++) n += t.dataGenFns[r](e);
        if (
          (e.attrs && (n += 'attrs:' + Ko(e.attrs) + ','),
          e.props && (n += 'domProps:' + Ko(e.props) + ','),
          e.events && (n += Mo(e.events, !1) + ','),
          e.nativeEvents && (n += Mo(e.nativeEvents, !0) + ','),
          e.slotTarget && !e.slotScope && (n += 'slot:' + e.slotTarget + ','),
          e.scopedSlots &&
            (n +=
              (function (e, t, n) {
                var a =
                    e.for ||
                    Object.keys(t).some(function (e) {
                      var n = t[e];
                      return n.slotTargetDynamic || n.if || n.for || Ho(n);
                    }),
                  r = !!e.if;
                if (!a)
                  for (var s = e.parent; s; ) {
                    if ((s.slotScope && '_empty_' !== s.slotScope) || s.for) {
                      a = !0;
                      break;
                    }
                    s.if && (r = !0), (s = s.parent);
                  }
                var o = Object.keys(t)
                  .map(function (e) {
                    return Vo(t[e], n);
                  })
                  .join(',');
                return (
                  'scopedSlots:_u([' +
                  o +
                  ']' +
                  (a ? ',null,true' : '') +
                  (!a && r
                    ? ',null,false,' +
                      (function (e) {
                        var t = 5381,
                          n = e.length;
                        for (; n; ) t = (33 * t) ^ e.charCodeAt(--n);
                        return t >>> 0;
                      })(o)
                    : '') +
                  ')'
                );
              })(e, e.scopedSlots, t) + ','),
          e.model &&
            (n +=
              'model:{value:' +
              e.model.value +
              ',callback:' +
              e.model.callback +
              ',expression:' +
              e.model.expression +
              '},'),
          e.inlineTemplate)
        ) {
          var s = (function (e, t) {
            var n = e.children[0];
            0;
            if (n && 1 === n.type) {
              var a = Io(n, t.options);
              return (
                'inlineTemplate:{render:function(){' +
                a.render +
                '},staticRenderFns:[' +
                a.staticRenderFns
                  .map(function (e) {
                    return 'function(){' + e + '}';
                  })
                  .join(',') +
                ']}'
              );
            }
          })(e, t);
          s && (n += s + ',');
        }
        return (
          (n = n.replace(/,$/, '') + '}'),
          e.dynamicAttrs && (n = '_b(' + n + ',"' + e.tag + '",' + Ko(e.dynamicAttrs) + ')'),
          e.wrapData && (n = e.wrapData(n)),
          e.wrapListeners && (n = e.wrapListeners(n)),
          n
        );
      }
      function Ho(e) {
        return 1 === e.type && ('slot' === e.tag || e.children.some(Ho));
      }
      function Vo(e, t) {
        var n = e.attrsMap['slot-scope'];
        if (e.if && !e.ifProcessed && !n) return Do(e, t, Vo, 'null');
        if (e.for && !e.forProcessed) return Lo(e, t, Vo);
        var a = '_empty_' === e.slotScope ? '' : String(e.slotScope),
          r =
            'function(' +
            a +
            '){return ' +
            ('template' === e.tag
              ? e.if && n
                ? '(' + e.if + ')?' + (zo(e, t) || 'undefined') + ':undefined'
                : zo(e, t) || 'undefined'
              : No(e, t)) +
            '}',
          s = a ? '' : ',proxy:true';
        return '{key:' + (e.slotTarget || '"default"') + ',fn:' + r + s + '}';
      }
      function zo(e, t, n, a, r) {
        var s = e.children;
        if (s.length) {
          var o = s[0];
          if (1 === s.length && o.for && 'template' !== o.tag && 'slot' !== o.tag) {
            var i = n ? (t.maybeComponent(o) ? ',1' : ',0') : '';
            return '' + (a || No)(o, t) + i;
          }
          var p = n
              ? (function (e, t) {
                  for (var n = 0, a = 0; a < e.length; a++) {
                    var r = e[a];
                    if (1 === r.type) {
                      if (
                        qo(r) ||
                        (r.ifConditions &&
                          r.ifConditions.some(function (e) {
                            return qo(e.block);
                          }))
                      ) {
                        n = 2;
                        break;
                      }
                      (t(r) ||
                        (r.ifConditions &&
                          r.ifConditions.some(function (e) {
                            return t(e.block);
                          }))) &&
                        (n = 1);
                    }
                  }
                  return n;
                })(s, t.maybeComponent)
              : 0,
            u = r || Wo;
          return (
            '[' +
            s
              .map(function (e) {
                return u(e, t);
              })
              .join(',') +
            ']' +
            (p ? ',' + p : '')
          );
        }
      }
      function qo(e) {
        return void 0 !== e.for || 'template' === e.tag || 'slot' === e.tag;
      }
      function Wo(e, t) {
        return 1 === e.type
          ? No(e, t)
          : 3 === e.type && e.isComment
          ? (function (e) {
              return '_e(' + JSON.stringify(e.text) + ')';
            })(e)
          : (function (e) {
              return '_v(' + (2 === e.type ? e.expression : Jo(JSON.stringify(e.text))) + ')';
            })(e);
      }
      function Ko(e) {
        for (var t = '', n = '', a = 0; a < e.length; a++) {
          var r = e[a],
            s = Jo(r.value);
          r.dynamic ? (n += r.name + ',' + s + ',') : (t += '"' + r.name + '":' + s + ',');
        }
        return (t = '{' + t.slice(0, -1) + '}'), n ? '_d(' + t + ',[' + n.slice(0, -1) + '])' : t;
      }
      function Jo(e) {
        return e.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
      }
      new RegExp(
        '\\b' +
          'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,super,throw,while,yield,delete,export,import,return,switch,default,extends,finally,continue,debugger,function,arguments'
            .split(',')
            .join('\\b|\\b') +
          '\\b',
      ),
        new RegExp(
          '\\b' +
            'delete,typeof,void'.split(',').join('\\s*\\([^\\)]*\\)|\\b') +
            '\\s*\\([^\\)]*\\)',
        );
      function Zo(e, t) {
        try {
          return new Function(e);
        } catch (n) {
          return t.push({ err: n, code: e }), P;
        }
      }
      function Go(e) {
        var t = Object.create(null);
        return function (n, a, r) {
          (a = M({}, a)).warn;
          delete a.warn;
          var s = a.delimiters ? String(a.delimiters) + n : n;
          if (t[s]) return t[s];
          var o = e(n, a);
          var i = {},
            p = [];
          return (
            (i.render = Zo(o.render, p)),
            (i.staticRenderFns = o.staticRenderFns.map(function (e) {
              return Zo(e, p);
            })),
            (t[s] = i)
          );
        };
      }
      var Xo,
        Yo,
        Qo = ((Xo = function (e, t) {
          var n = oo(e.trim(), t);
          !1 !== t.optimize && ko(n, t);
          var a = Io(n, t);
          return { ast: n, render: a.render, staticRenderFns: a.staticRenderFns };
        }),
        function (e) {
          function t(t, n) {
            var a = Object.create(e),
              r = [],
              s = [];
            if (n)
              for (var o in (n.modules && (a.modules = (e.modules || []).concat(n.modules)),
              n.directives &&
                (a.directives = M(Object.create(e.directives || null), n.directives)),
              n))
                'modules' !== o && 'directives' !== o && (a[o] = n[o]);
            a.warn = function (e, t, n) {
              (n ? s : r).push(e);
            };
            var i = Xo(t.trim(), a);
            return (i.errors = r), (i.tips = s), i;
          }
          return { compile: t, compileToFunctions: Go(t) };
        })(bo),
        ei = (Qo.compile, Qo.compileToFunctions);
      function ti(e) {
        return (
          ((Yo = Yo || document.createElement('div')).innerHTML = e
            ? '<a href="\n"/>'
            : '<div a="\n"/>'),
          Yo.innerHTML.indexOf('&#10;') > 0
        );
      }
      var ni = !!K && ti(!1),
        ai = !!K && ti(!0),
        ri = k(function (e) {
          var t = ea(e);
          return t && t.innerHTML;
        }),
        si = xn.prototype.$mount;
      (xn.prototype.$mount = function (e, t) {
        if ((e = e && ea(e)) === document.body || e === document.documentElement) return this;
        var n = this.$options;
        if (!n.render) {
          var a = n.template;
          if (a)
            if ('string' == typeof a) '#' === a.charAt(0) && (a = ri(a));
            else {
              if (!a.nodeType) return this;
              a = a.innerHTML;
            }
          else
            e &&
              (a = (function (e) {
                if (e.outerHTML) return e.outerHTML;
                var t = document.createElement('div');
                return t.appendChild(e.cloneNode(!0)), t.innerHTML;
              })(e));
          if (a) {
            0;
            var r = ei(
                a,
                {
                  outputSourceRange: !1,
                  shouldDecodeNewlines: ni,
                  shouldDecodeNewlinesForHref: ai,
                  delimiters: n.delimiters,
                  comments: n.comments,
                },
                this,
              ),
              s = r.render,
              o = r.staticRenderFns;
            (n.render = s), (n.staticRenderFns = o);
          }
        }
        return si.call(this, e, t);
      }),
        (xn.compile = ei),
        (t.a = xn);
    }.call(this, n(0), n(7).setImmediate));
  },
  function (e) {
    e.exports = JSON.parse(
      '{"a":"hardhat-docgen","b":"https://github.com/ItsNickBarry/hardhat-docgen"}',
    );
  },
  function (e, t, n) {
    var a = n(5);
    a.__esModule && (a = a.default),
      'string' == typeof a && (a = [[e.i, a, '']]),
      a.locals && (e.exports = a.locals);
    (0, n(11).default)('0b345cf4', a, !1, {});
  },
  function (e, t, n) {
    'use strict';
    n(3);
  },
  function (e, t, n) {
    (t = e.exports = n(6)(!1)).push([
      e.i,
      '@import url(https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap);',
      '',
    ]),
      t.push([e.i, "\nhtml,\nbody {\n  font-family: 'Source Code Pro', monospace;\n}\n", '']);
  },
  function (e, t, n) {
    'use strict';
    e.exports = function (e) {
      var t = [];
      return (
        (t.toString = function () {
          return this.map(function (t) {
            var n = (function (e, t) {
              var n = e[1] || '',
                a = e[3];
              if (!a) return n;
              if (t && 'function' == typeof btoa) {
                var r =
                    ((o = a),
                    '/*# sourceMappingURL=data:application/json;charset=utf-8;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(o)))) +
                      ' */'),
                  s = a.sources.map(function (e) {
                    return '/*# sourceURL=' + a.sourceRoot + e + ' */';
                  });
                return [n].concat(s).concat([r]).join('\n');
              }
              var o;
              return [n].join('\n');
            })(t, e);
            return t[2] ? '@media ' + t[2] + '{' + n + '}' : n;
          }).join('');
        }),
        (t.i = function (e, n) {
          'string' == typeof e && (e = [[null, e, '']]);
          for (var a = {}, r = 0; r < this.length; r++) {
            var s = this[r][0];
            null != s && (a[s] = !0);
          }
          for (r = 0; r < e.length; r++) {
            var o = e[r];
            (null != o[0] && a[o[0]]) ||
              (n && !o[2] ? (o[2] = n) : n && (o[2] = '(' + o[2] + ') and (' + n + ')'),
              t.push(o));
          }
        }),
        t
      );
    };
  },
  function (e, t, n) {
    (function (e) {
      var a = (void 0 !== e && e) || ('undefined' != typeof self && self) || window,
        r = Function.prototype.apply;
      function s(e, t) {
        (this._id = e), (this._clearFn = t);
      }
      (t.setTimeout = function () {
        return new s(r.call(setTimeout, a, arguments), clearTimeout);
      }),
        (t.setInterval = function () {
          return new s(r.call(setInterval, a, arguments), clearInterval);
        }),
        (t.clearTimeout = t.clearInterval =
          function (e) {
            e && e.close();
          }),
        (s.prototype.unref = s.prototype.ref = function () {}),
        (s.prototype.close = function () {
          this._clearFn.call(a, this._id);
        }),
        (t.enroll = function (e, t) {
          clearTimeout(e._idleTimeoutId), (e._idleTimeout = t);
        }),
        (t.unenroll = function (e) {
          clearTimeout(e._idleTimeoutId), (e._idleTimeout = -1);
        }),
        (t._unrefActive = t.active =
          function (e) {
            clearTimeout(e._idleTimeoutId);
            var t = e._idleTimeout;
            t >= 0 &&
              (e._idleTimeoutId = setTimeout(function () {
                e._onTimeout && e._onTimeout();
              }, t));
          }),
        n(8),
        (t.setImmediate =
          ('undefined' != typeof self && self.setImmediate) ||
          (void 0 !== e && e.setImmediate) ||
          (this && this.setImmediate)),
        (t.clearImmediate =
          ('undefined' != typeof self && self.clearImmediate) ||
          (void 0 !== e && e.clearImmediate) ||
          (this && this.clearImmediate));
    }.call(this, n(0)));
  },
  function (e, t, n) {
    (function (e, t) {
      !(function (e, n) {
        'use strict';
        if (!e.setImmediate) {
          var a,
            r,
            s,
            o,
            i,
            p = 1,
            u = {},
            l = !1,
            d = e.document,
            c = Object.getPrototypeOf && Object.getPrototypeOf(e);
          (c = c && c.setTimeout ? c : e),
            '[object process]' === {}.toString.call(e.process)
              ? (a = function (e) {
                  t.nextTick(function () {
                    m(e);
                  });
                })
              : !(function () {
                  if (e.postMessage && !e.importScripts) {
                    var t = !0,
                      n = e.onmessage;
                    return (
                      (e.onmessage = function () {
                        t = !1;
                      }),
                      e.postMessage('', '*'),
                      (e.onmessage = n),
                      t
                    );
                  }
                })()
              ? e.MessageChannel
                ? (((s = new MessageChannel()).port1.onmessage = function (e) {
                    m(e.data);
                  }),
                  (a = function (e) {
                    s.port2.postMessage(e);
                  }))
                : d && 'onreadystatechange' in d.createElement('script')
                ? ((r = d.documentElement),
                  (a = function (e) {
                    var t = d.createElement('script');
                    (t.onreadystatechange = function () {
                      m(e), (t.onreadystatechange = null), r.removeChild(t), (t = null);
                    }),
                      r.appendChild(t);
                  }))
                : (a = function (e) {
                    setTimeout(m, 0, e);
                  })
              : ((o = 'setImmediate$' + Math.random() + '$'),
                (i = function (t) {
                  t.source === e &&
                    'string' == typeof t.data &&
                    0 === t.data.indexOf(o) &&
                    m(+t.data.slice(o.length));
                }),
                e.addEventListener
                  ? e.addEventListener('message', i, !1)
                  : e.attachEvent('onmessage', i),
                (a = function (t) {
                  e.postMessage(o + t, '*');
                })),
            (c.setImmediate = function (e) {
              'function' != typeof e && (e = new Function('' + e));
              for (var t = new Array(arguments.length - 1), n = 0; n < t.length; n++)
                t[n] = arguments[n + 1];
              var r = { callback: e, args: t };
              return (u[p] = r), a(p), p++;
            }),
            (c.clearImmediate = y);
        }
        function y(e) {
          delete u[e];
        }
        function m(e) {
          if (l) setTimeout(m, 0, e);
          else {
            var t = u[e];
            if (t) {
              l = !0;
              try {
                !(function (e) {
                  var t = e.callback,
                    n = e.args;
                  switch (n.length) {
                    case 0:
                      t();
                      break;
                    case 1:
                      t(n[0]);
                      break;
                    case 2:
                      t(n[0], n[1]);
                      break;
                    case 3:
                      t(n[0], n[1], n[2]);
                      break;
                    default:
                      t.apply(void 0, n);
                  }
                })(t);
              } finally {
                y(e), (l = !1);
              }
            }
          }
        }
      })('undefined' == typeof self ? (void 0 === e ? this : e) : self);
    }.call(this, n(0), n(9)));
  },
  function (e, t) {
    var n,
      a,
      r = (e.exports = {});
    function s() {
      throw new Error('setTimeout has not been defined');
    }
    function o() {
      throw new Error('clearTimeout has not been defined');
    }
    function i(e) {
      if (n === setTimeout) return setTimeout(e, 0);
      if ((n === s || !n) && setTimeout) return (n = setTimeout), setTimeout(e, 0);
      try {
        return n(e, 0);
      } catch (t) {
        try {
          return n.call(null, e, 0);
        } catch (t) {
          return n.call(this, e, 0);
        }
      }
    }
    !(function () {
      try {
        n = 'function' == typeof setTimeout ? setTimeout : s;
      } catch (e) {
        n = s;
      }
      try {
        a = 'function' == typeof clearTimeout ? clearTimeout : o;
      } catch (e) {
        a = o;
      }
    })();
    var p,
      u = [],
      l = !1,
      d = -1;
    function c() {
      l && p && ((l = !1), p.length ? (u = p.concat(u)) : (d = -1), u.length && y());
    }
    function y() {
      if (!l) {
        var e = i(c);
        l = !0;
        for (var t = u.length; t; ) {
          for (p = u, u = []; ++d < t; ) p && p[d].run();
          (d = -1), (t = u.length);
        }
        (p = null),
          (l = !1),
          (function (e) {
            if (a === clearTimeout) return clearTimeout(e);
            if ((a === o || !a) && clearTimeout) return (a = clearTimeout), clearTimeout(e);
            try {
              a(e);
            } catch (t) {
              try {
                return a.call(null, e);
              } catch (t) {
                return a.call(this, e);
              }
            }
          })(e);
      }
    }
    function m(e, t) {
      (this.fun = e), (this.array = t);
    }
    function f() {}
    (r.nextTick = function (e) {
      var t = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
      u.push(new m(e, t)), 1 !== u.length || l || i(y);
    }),
      (m.prototype.run = function () {
        this.fun.apply(null, this.array);
      }),
      (r.title = 'browser'),
      (r.browser = !0),
      (r.env = {}),
      (r.argv = []),
      (r.version = ''),
      (r.versions = {}),
      (r.on = f),
      (r.addListener = f),
      (r.once = f),
      (r.off = f),
      (r.removeListener = f),
      (r.removeAllListeners = f),
      (r.emit = f),
      (r.prependListener = f),
      (r.prependOnceListener = f),
      (r.listeners = function (e) {
        return [];
      }),
      (r.binding = function (e) {
        throw new Error('process.binding is not supported');
      }),
      (r.cwd = function () {
        return '/';
      }),
      (r.chdir = function (e) {
        throw new Error('process.chdir is not supported');
      }),
      (r.umask = function () {
        return 0;
      });
  },
  function (e, t, n) {
    'use strict';
    n.r(t);
    var a = n(1);
    /*!
     * vue-router v3.5.1
     * (c) 2021 Evan You
     * @license MIT
     */ function r(e, t) {
      for (var n in t) e[n] = t[n];
      return e;
    }
    var s = /[!'()*]/g,
      o = function (e) {
        return '%' + e.charCodeAt(0).toString(16);
      },
      i = /%2C/g,
      p = function (e) {
        return encodeURIComponent(e).replace(s, o).replace(i, ',');
      };
    function u(e) {
      try {
        return decodeURIComponent(e);
      } catch (e) {
        0;
      }
      return e;
    }
    var l = function (e) {
      return null == e || 'object' == typeof e ? e : String(e);
    };
    function d(e) {
      var t = {};
      return (e = e.trim().replace(/^(\?|#|&)/, ''))
        ? (e.split('&').forEach(function (e) {
            var n = e.replace(/\+/g, ' ').split('='),
              a = u(n.shift()),
              r = n.length > 0 ? u(n.join('=')) : null;
            void 0 === t[a] ? (t[a] = r) : Array.isArray(t[a]) ? t[a].push(r) : (t[a] = [t[a], r]);
          }),
          t)
        : t;
    }
    function c(e) {
      var t = e
        ? Object.keys(e)
            .map(function (t) {
              var n = e[t];
              if (void 0 === n) return '';
              if (null === n) return p(t);
              if (Array.isArray(n)) {
                var a = [];
                return (
                  n.forEach(function (e) {
                    void 0 !== e && (null === e ? a.push(p(t)) : a.push(p(t) + '=' + p(e)));
                  }),
                  a.join('&')
                );
              }
              return p(t) + '=' + p(n);
            })
            .filter(function (e) {
              return e.length > 0;
            })
            .join('&')
        : null;
      return t ? '?' + t : '';
    }
    var y = /\/?$/;
    function m(e, t, n, a) {
      var r = a && a.options.stringifyQuery,
        s = t.query || {};
      try {
        s = f(s);
      } catch (e) {}
      var o = {
        name: t.name || (e && e.name),
        meta: (e && e.meta) || {},
        path: t.path || '/',
        hash: t.hash || '',
        query: s,
        params: t.params || {},
        fullPath: g(t, r),
        matched: e ? v(e) : [],
      };
      return n && (o.redirectedFrom = g(n, r)), Object.freeze(o);
    }
    function f(e) {
      if (Array.isArray(e)) return e.map(f);
      if (e && 'object' == typeof e) {
        var t = {};
        for (var n in e) t[n] = f(e[n]);
        return t;
      }
      return e;
    }
    var h = m(null, { path: '/' });
    function v(e) {
      for (var t = []; e; ) t.unshift(e), (e = e.parent);
      return t;
    }
    function g(e, t) {
      var n = e.path,
        a = e.query;
      void 0 === a && (a = {});
      var r = e.hash;
      return void 0 === r && (r = ''), (n || '/') + (t || c)(a) + r;
    }
    function T(e, t, n) {
      return t === h
        ? e === t
        : !!t &&
            (e.path && t.path
              ? e.path.replace(y, '') === t.path.replace(y, '') &&
                (n || (e.hash === t.hash && b(e.query, t.query)))
              : !(!e.name || !t.name) &&
                e.name === t.name &&
                (n || (e.hash === t.hash && b(e.query, t.query) && b(e.params, t.params))));
    }
    function b(e, t) {
      if ((void 0 === e && (e = {}), void 0 === t && (t = {}), !e || !t)) return e === t;
      var n = Object.keys(e).sort(),
        a = Object.keys(t).sort();
      return (
        n.length === a.length &&
        n.every(function (n, r) {
          var s = e[n];
          if (a[r] !== n) return !1;
          var o = t[n];
          return null == s || null == o
            ? s === o
            : 'object' == typeof s && 'object' == typeof o
            ? b(s, o)
            : String(s) === String(o);
        })
      );
    }
    function w(e) {
      for (var t = 0; t < e.matched.length; t++) {
        var n = e.matched[t];
        for (var a in n.instances) {
          var r = n.instances[a],
            s = n.enteredCbs[a];
          if (r && s) {
            delete n.enteredCbs[a];
            for (var o = 0; o < s.length; o++) r._isBeingDestroyed || s[o](r);
          }
        }
      }
    }
    var k = {
      name: 'RouterView',
      functional: !0,
      props: { name: { type: String, default: 'default' } },
      render: function (e, t) {
        var n = t.props,
          a = t.children,
          s = t.parent,
          o = t.data;
        o.routerView = !0;
        for (
          var i = s.$createElement,
            p = n.name,
            u = s.$route,
            l = s._routerViewCache || (s._routerViewCache = {}),
            d = 0,
            c = !1;
          s && s._routerRoot !== s;

        ) {
          var y = s.$vnode ? s.$vnode.data : {};
          y.routerView && d++,
            y.keepAlive && s._directInactive && s._inactive && (c = !0),
            (s = s.$parent);
        }
        if (((o.routerViewDepth = d), c)) {
          var m = l[p],
            f = m && m.component;
          return f ? (m.configProps && A(f, o, m.route, m.configProps), i(f, o, a)) : i();
        }
        var h = u.matched[d],
          v = h && h.components[p];
        if (!h || !v) return (l[p] = null), i();
        (l[p] = { component: v }),
          (o.registerRouteInstance = function (e, t) {
            var n = h.instances[p];
            ((t && n !== e) || (!t && n === e)) && (h.instances[p] = t);
          }),
          ((o.hook || (o.hook = {})).prepatch = function (e, t) {
            h.instances[p] = t.componentInstance;
          }),
          (o.hook.init = function (e) {
            e.data.keepAlive &&
              e.componentInstance &&
              e.componentInstance !== h.instances[p] &&
              (h.instances[p] = e.componentInstance),
              w(u);
          });
        var g = h.props && h.props[p];
        return g && (r(l[p], { route: u, configProps: g }), A(v, o, u, g)), i(v, o, a);
      },
    };
    function A(e, t, n, a) {
      var s = (t.props = (function (e, t) {
        switch (typeof t) {
          case 'undefined':
            return;
          case 'object':
            return t;
          case 'function':
            return t(e);
          case 'boolean':
            return t ? e.params : void 0;
          default:
            0;
        }
      })(n, a));
      if (s) {
        s = t.props = r({}, s);
        var o = (t.attrs = t.attrs || {});
        for (var i in s) (e.props && i in e.props) || ((o[i] = s[i]), delete s[i]);
      }
    }
    function _(e, t, n) {
      var a = e.charAt(0);
      if ('/' === a) return e;
      if ('?' === a || '#' === a) return t + e;
      var r = t.split('/');
      (n && r[r.length - 1]) || r.pop();
      for (var s = e.replace(/^\//, '').split('/'), o = 0; o < s.length; o++) {
        var i = s[o];
        '..' === i ? r.pop() : '.' !== i && r.push(i);
      }
      return '' !== r[0] && r.unshift(''), r.join('/');
    }
    function x(e) {
      return e.replace(/\/\//g, '/');
    }
    var O =
        Array.isArray ||
        function (e) {
          return '[object Array]' == Object.prototype.toString.call(e);
        },
      S = U,
      C = F,
      B = function (e, t) {
        return I(F(e, t), t);
      },
      M = I,
      $ = L,
      P = new RegExp(
        [
          '(\\\\.)',
          '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))',
        ].join('|'),
        'g',
      );
    function F(e, t) {
      for (
        var n, a = [], r = 0, s = 0, o = '', i = (t && t.delimiter) || '/';
        null != (n = P.exec(e));

      ) {
        var p = n[0],
          u = n[1],
          l = n.index;
        if (((o += e.slice(s, l)), (s = l + p.length), u)) o += u[1];
        else {
          var d = e[s],
            c = n[2],
            y = n[3],
            m = n[4],
            f = n[5],
            h = n[6],
            v = n[7];
          o && (a.push(o), (o = ''));
          var g = null != c && null != d && d !== c,
            T = '+' === h || '*' === h,
            b = '?' === h || '*' === h,
            w = n[2] || i,
            k = m || f;
          a.push({
            name: y || r++,
            prefix: c || '',
            delimiter: w,
            optional: b,
            repeat: T,
            partial: g,
            asterisk: !!v,
            pattern: k ? R(k) : v ? '.*' : '[^' + N(w) + ']+?',
          });
        }
      }
      return s < e.length && (o += e.substr(s)), o && a.push(o), a;
    }
    function E(e) {
      return encodeURI(e).replace(/[\/?#]/g, function (e) {
        return '%' + e.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    function I(e, t) {
      for (var n = new Array(e.length), a = 0; a < e.length; a++)
        'object' == typeof e[a] && (n[a] = new RegExp('^(?:' + e[a].pattern + ')$', D(t)));
      return function (t, a) {
        for (
          var r = '', s = t || {}, o = (a || {}).pretty ? E : encodeURIComponent, i = 0;
          i < e.length;
          i++
        ) {
          var p = e[i];
          if ('string' != typeof p) {
            var u,
              l = s[p.name];
            if (null == l) {
              if (p.optional) {
                p.partial && (r += p.prefix);
                continue;
              }
              throw new TypeError('Expected "' + p.name + '" to be defined');
            }
            if (O(l)) {
              if (!p.repeat)
                throw new TypeError(
                  'Expected "' +
                    p.name +
                    '" to not repeat, but received `' +
                    JSON.stringify(l) +
                    '`',
                );
              if (0 === l.length) {
                if (p.optional) continue;
                throw new TypeError('Expected "' + p.name + '" to not be empty');
              }
              for (var d = 0; d < l.length; d++) {
                if (((u = o(l[d])), !n[i].test(u)))
                  throw new TypeError(
                    'Expected all "' +
                      p.name +
                      '" to match "' +
                      p.pattern +
                      '", but received `' +
                      JSON.stringify(u) +
                      '`',
                  );
                r += (0 === d ? p.prefix : p.delimiter) + u;
              }
            } else {
              if (
                ((u = p.asterisk
                  ? encodeURI(l).replace(/[?#]/g, function (e) {
                      return '%' + e.charCodeAt(0).toString(16).toUpperCase();
                    })
                  : o(l)),
                !n[i].test(u))
              )
                throw new TypeError(
                  'Expected "' +
                    p.name +
                    '" to match "' +
                    p.pattern +
                    '", but received "' +
                    u +
                    '"',
                );
              r += p.prefix + u;
            }
          } else r += p;
        }
        return r;
      };
    }
    function N(e) {
      return e.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
    }
    function R(e) {
      return e.replace(/([=!:$\/()])/g, '\\$1');
    }
    function j(e, t) {
      return (e.keys = t), e;
    }
    function D(e) {
      return e && e.sensitive ? '' : 'i';
    }
    function L(e, t, n) {
      O(t) || ((n = t || n), (t = []));
      for (var a = (n = n || {}).strict, r = !1 !== n.end, s = '', o = 0; o < e.length; o++) {
        var i = e[o];
        if ('string' == typeof i) s += N(i);
        else {
          var p = N(i.prefix),
            u = '(?:' + i.pattern + ')';
          t.push(i),
            i.repeat && (u += '(?:' + p + u + ')*'),
            (s += u =
              i.optional
                ? i.partial
                  ? p + '(' + u + ')?'
                  : '(?:' + p + '(' + u + '))?'
                : p + '(' + u + ')');
        }
      }
      var l = N(n.delimiter || '/'),
        d = s.slice(-l.length) === l;
      return (
        a || (s = (d ? s.slice(0, -l.length) : s) + '(?:' + l + '(?=$))?'),
        (s += r ? '$' : a && d ? '' : '(?=' + l + '|$)'),
        j(new RegExp('^' + s, D(n)), t)
      );
    }
    function U(e, t, n) {
      return (
        O(t) || ((n = t || n), (t = [])),
        (n = n || {}),
        e instanceof RegExp
          ? (function (e, t) {
              var n = e.source.match(/\((?!\?)/g);
              if (n)
                for (var a = 0; a < n.length; a++)
                  t.push({
                    name: a,
                    prefix: null,
                    delimiter: null,
                    optional: !1,
                    repeat: !1,
                    partial: !1,
                    asterisk: !1,
                    pattern: null,
                  });
              return j(e, t);
            })(e, t)
          : O(e)
          ? (function (e, t, n) {
              for (var a = [], r = 0; r < e.length; r++) a.push(U(e[r], t, n).source);
              return j(new RegExp('(?:' + a.join('|') + ')', D(n)), t);
            })(e, t, n)
          : (function (e, t, n) {
              return L(F(e, n), t, n);
            })(e, t, n)
      );
    }
    (S.parse = C), (S.compile = B), (S.tokensToFunction = M), (S.tokensToRegExp = $);
    var H = Object.create(null);
    function V(e, t, n) {
      t = t || {};
      try {
        var a = H[e] || (H[e] = S.compile(e));
        return 'string' == typeof t.pathMatch && (t[0] = t.pathMatch), a(t, { pretty: !0 });
      } catch (e) {
        return '';
      } finally {
        delete t[0];
      }
    }
    function z(e, t, n, a) {
      var s = 'string' == typeof e ? { path: e } : e;
      if (s._normalized) return s;
      if (s.name) {
        var o = (s = r({}, e)).params;
        return o && 'object' == typeof o && (s.params = r({}, o)), s;
      }
      if (!s.path && s.params && t) {
        (s = r({}, s))._normalized = !0;
        var i = r(r({}, t.params), s.params);
        if (t.name) (s.name = t.name), (s.params = i);
        else if (t.matched.length) {
          var p = t.matched[t.matched.length - 1].path;
          s.path = V(p, i, t.path);
        } else 0;
        return s;
      }
      var u = (function (e) {
          var t = '',
            n = '',
            a = e.indexOf('#');
          a >= 0 && ((t = e.slice(a)), (e = e.slice(0, a)));
          var r = e.indexOf('?');
          return (
            r >= 0 && ((n = e.slice(r + 1)), (e = e.slice(0, r))), { path: e, query: n, hash: t }
          );
        })(s.path || ''),
        c = (t && t.path) || '/',
        y = u.path ? _(u.path, c, n || s.append) : c,
        m = (function (e, t, n) {
          void 0 === t && (t = {});
          var a,
            r = n || d;
          try {
            a = r(e || '');
          } catch (e) {
            a = {};
          }
          for (var s in t) {
            var o = t[s];
            a[s] = Array.isArray(o) ? o.map(l) : l(o);
          }
          return a;
        })(u.query, s.query, a && a.options.parseQuery),
        f = s.hash || u.hash;
      return (
        f && '#' !== f.charAt(0) && (f = '#' + f), { _normalized: !0, path: y, query: m, hash: f }
      );
    }
    var q,
      W = function () {},
      K = {
        name: 'RouterLink',
        props: {
          to: { type: [String, Object], required: !0 },
          tag: { type: String, default: 'a' },
          custom: Boolean,
          exact: Boolean,
          exactPath: Boolean,
          append: Boolean,
          replace: Boolean,
          activeClass: String,
          exactActiveClass: String,
          ariaCurrentValue: { type: String, default: 'page' },
          event: { type: [String, Array], default: 'click' },
        },
        render: function (e) {
          var t = this,
            n = this.$router,
            a = this.$route,
            s = n.resolve(this.to, a, this.append),
            o = s.location,
            i = s.route,
            p = s.href,
            u = {},
            l = n.options.linkActiveClass,
            d = n.options.linkExactActiveClass,
            c = null == l ? 'router-link-active' : l,
            f = null == d ? 'router-link-exact-active' : d,
            h = null == this.activeClass ? c : this.activeClass,
            v = null == this.exactActiveClass ? f : this.exactActiveClass,
            g = i.redirectedFrom ? m(null, z(i.redirectedFrom), null, n) : i;
          (u[v] = T(a, g, this.exactPath)),
            (u[h] =
              this.exact || this.exactPath
                ? u[v]
                : (function (e, t) {
                    return (
                      0 === e.path.replace(y, '/').indexOf(t.path.replace(y, '/')) &&
                      (!t.hash || e.hash === t.hash) &&
                      (function (e, t) {
                        for (var n in t) if (!(n in e)) return !1;
                        return !0;
                      })(e.query, t.query)
                    );
                  })(a, g));
          var b = u[v] ? this.ariaCurrentValue : null,
            w = function (e) {
              J(e) && (t.replace ? n.replace(o, W) : n.push(o, W));
            },
            k = { click: J };
          Array.isArray(this.event)
            ? this.event.forEach(function (e) {
                k[e] = w;
              })
            : (k[this.event] = w);
          var A = { class: u },
            _ =
              !this.$scopedSlots.$hasNormal &&
              this.$scopedSlots.default &&
              this.$scopedSlots.default({
                href: p,
                route: i,
                navigate: w,
                isActive: u[h],
                isExactActive: u[v],
              });
          if (_) {
            if (1 === _.length) return _[0];
            if (_.length > 1 || !_.length) return 0 === _.length ? e() : e('span', {}, _);
          }
          if ('a' === this.tag) (A.on = k), (A.attrs = { href: p, 'aria-current': b });
          else {
            var x = (function e(t) {
              var n;
              if (t)
                for (var a = 0; a < t.length; a++) {
                  if ('a' === (n = t[a]).tag) return n;
                  if (n.children && (n = e(n.children))) return n;
                }
            })(this.$slots.default);
            if (x) {
              x.isStatic = !1;
              var O = (x.data = r({}, x.data));
              for (var S in ((O.on = O.on || {}), O.on)) {
                var C = O.on[S];
                S in k && (O.on[S] = Array.isArray(C) ? C : [C]);
              }
              for (var B in k) B in O.on ? O.on[B].push(k[B]) : (O.on[B] = w);
              var M = (x.data.attrs = r({}, x.data.attrs));
              (M.href = p), (M['aria-current'] = b);
            } else A.on = k;
          }
          return e(this.tag, A, this.$slots.default);
        },
      };
    function J(e) {
      if (
        !(
          e.metaKey ||
          e.altKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.defaultPrevented ||
          (void 0 !== e.button && 0 !== e.button)
        )
      ) {
        if (e.currentTarget && e.currentTarget.getAttribute) {
          var t = e.currentTarget.getAttribute('target');
          if (/\b_blank\b/i.test(t)) return;
        }
        return e.preventDefault && e.preventDefault(), !0;
      }
    }
    var Z = 'undefined' != typeof window;
    function G(e, t, n, a, r) {
      var s = t || [],
        o = n || Object.create(null),
        i = a || Object.create(null);
      e.forEach(function (e) {
        !(function e(t, n, a, r, s, o) {
          var i = r.path,
            p = r.name;
          0;
          var u = r.pathToRegexpOptions || {},
            l = (function (e, t, n) {
              n || (e = e.replace(/\/$/, ''));
              if ('/' === e[0]) return e;
              if (null == t) return e;
              return x(t.path + '/' + e);
            })(i, s, u.strict);
          'boolean' == typeof r.caseSensitive && (u.sensitive = r.caseSensitive);
          var d = {
            path: l,
            regex: X(l, u),
            components: r.components || { default: r.component },
            alias: r.alias ? ('string' == typeof r.alias ? [r.alias] : r.alias) : [],
            instances: {},
            enteredCbs: {},
            name: p,
            parent: s,
            matchAs: o,
            redirect: r.redirect,
            beforeEnter: r.beforeEnter,
            meta: r.meta || {},
            props: null == r.props ? {} : r.components ? r.props : { default: r.props },
          };
          r.children &&
            r.children.forEach(function (r) {
              var s = o ? x(o + '/' + r.path) : void 0;
              e(t, n, a, r, d, s);
            });
          n[d.path] || (t.push(d.path), (n[d.path] = d));
          if (void 0 !== r.alias)
            for (var c = Array.isArray(r.alias) ? r.alias : [r.alias], y = 0; y < c.length; ++y) {
              0;
              var m = { path: c[y], children: r.children };
              e(t, n, a, m, s, d.path || '/');
            }
          p && (a[p] || (a[p] = d));
        })(s, o, i, e, r);
      });
      for (var p = 0, u = s.length; p < u; p++)
        '*' === s[p] && (s.push(s.splice(p, 1)[0]), u--, p--);
      return { pathList: s, pathMap: o, nameMap: i };
    }
    function X(e, t) {
      return S(e, [], t);
    }
    function Y(e, t) {
      var n = G(e),
        a = n.pathList,
        r = n.pathMap,
        s = n.nameMap;
      function o(e, n, o) {
        var i = z(e, n, !1, t),
          u = i.name;
        if (u) {
          var l = s[u];
          if (!l) return p(null, i);
          var d = l.regex.keys
            .filter(function (e) {
              return !e.optional;
            })
            .map(function (e) {
              return e.name;
            });
          if (('object' != typeof i.params && (i.params = {}), n && 'object' == typeof n.params))
            for (var c in n.params)
              !(c in i.params) && d.indexOf(c) > -1 && (i.params[c] = n.params[c]);
          return (i.path = V(l.path, i.params)), p(l, i, o);
        }
        if (i.path) {
          i.params = {};
          for (var y = 0; y < a.length; y++) {
            var m = a[y],
              f = r[m];
            if (Q(f.regex, i.path, i.params)) return p(f, i, o);
          }
        }
        return p(null, i);
      }
      function i(e, n) {
        var a = e.redirect,
          r = 'function' == typeof a ? a(m(e, n, null, t)) : a;
        if (('string' == typeof r && (r = { path: r }), !r || 'object' != typeof r))
          return p(null, n);
        var i = r,
          u = i.name,
          l = i.path,
          d = n.query,
          c = n.hash,
          y = n.params;
        if (
          ((d = i.hasOwnProperty('query') ? i.query : d),
          (c = i.hasOwnProperty('hash') ? i.hash : c),
          (y = i.hasOwnProperty('params') ? i.params : y),
          u)
        ) {
          s[u];
          return o({ _normalized: !0, name: u, query: d, hash: c, params: y }, void 0, n);
        }
        if (l) {
          var f = (function (e, t) {
            return _(e, t.parent ? t.parent.path : '/', !0);
          })(l, e);
          return o({ _normalized: !0, path: V(f, y), query: d, hash: c }, void 0, n);
        }
        return p(null, n);
      }
      function p(e, n, a) {
        return e && e.redirect
          ? i(e, a || n)
          : e && e.matchAs
          ? (function (e, t, n) {
              var a = o({ _normalized: !0, path: V(n, t.params) });
              if (a) {
                var r = a.matched,
                  s = r[r.length - 1];
                return (t.params = a.params), p(s, t);
              }
              return p(null, t);
            })(0, n, e.matchAs)
          : m(e, n, a, t);
      }
      return {
        match: o,
        addRoute: function (e, t) {
          var n = 'object' != typeof e ? s[e] : void 0;
          G([t || e], a, r, s, n),
            n &&
              G(
                n.alias.map(function (e) {
                  return { path: e, children: [t] };
                }),
                a,
                r,
                s,
                n,
              );
        },
        getRoutes: function () {
          return a.map(function (e) {
            return r[e];
          });
        },
        addRoutes: function (e) {
          G(e, a, r, s);
        },
      };
    }
    function Q(e, t, n) {
      var a = t.match(e);
      if (!a) return !1;
      if (!n) return !0;
      for (var r = 1, s = a.length; r < s; ++r) {
        var o = e.keys[r - 1];
        o && (n[o.name || 'pathMatch'] = 'string' == typeof a[r] ? u(a[r]) : a[r]);
      }
      return !0;
    }
    var ee = Z && window.performance && window.performance.now ? window.performance : Date;
    function te() {
      return ee.now().toFixed(3);
    }
    var ne = te();
    function ae() {
      return ne;
    }
    function re(e) {
      return (ne = e);
    }
    var se = Object.create(null);
    function oe() {
      'scrollRestoration' in window.history && (window.history.scrollRestoration = 'manual');
      var e = window.location.protocol + '//' + window.location.host,
        t = window.location.href.replace(e, ''),
        n = r({}, window.history.state);
      return (
        (n.key = ae()),
        window.history.replaceState(n, '', t),
        window.addEventListener('popstate', ue),
        function () {
          window.removeEventListener('popstate', ue);
        }
      );
    }
    function ie(e, t, n, a) {
      if (e.app) {
        var r = e.options.scrollBehavior;
        r &&
          e.app.$nextTick(function () {
            var s = (function () {
                var e = ae();
                if (e) return se[e];
              })(),
              o = r.call(e, t, n, a ? s : null);
            o &&
              ('function' == typeof o.then
                ? o
                    .then(function (e) {
                      me(e, s);
                    })
                    .catch(function (e) {
                      0;
                    })
                : me(o, s));
          });
      }
    }
    function pe() {
      var e = ae();
      e && (se[e] = { x: window.pageXOffset, y: window.pageYOffset });
    }
    function ue(e) {
      pe(), e.state && e.state.key && re(e.state.key);
    }
    function le(e) {
      return ce(e.x) || ce(e.y);
    }
    function de(e) {
      return { x: ce(e.x) ? e.x : window.pageXOffset, y: ce(e.y) ? e.y : window.pageYOffset };
    }
    function ce(e) {
      return 'number' == typeof e;
    }
    var ye = /^#\d/;
    function me(e, t) {
      var n,
        a = 'object' == typeof e;
      if (a && 'string' == typeof e.selector) {
        var r = ye.test(e.selector)
          ? document.getElementById(e.selector.slice(1))
          : document.querySelector(e.selector);
        if (r) {
          var s = e.offset && 'object' == typeof e.offset ? e.offset : {};
          t = (function (e, t) {
            var n = document.documentElement.getBoundingClientRect(),
              a = e.getBoundingClientRect();
            return { x: a.left - n.left - t.x, y: a.top - n.top - t.y };
          })(r, (s = { x: ce((n = s).x) ? n.x : 0, y: ce(n.y) ? n.y : 0 }));
        } else le(e) && (t = de(e));
      } else a && le(e) && (t = de(e));
      t &&
        ('scrollBehavior' in document.documentElement.style
          ? window.scrollTo({ left: t.x, top: t.y, behavior: e.behavior })
          : window.scrollTo(t.x, t.y));
    }
    var fe,
      he =
        Z &&
        ((-1 === (fe = window.navigator.userAgent).indexOf('Android 2.') &&
          -1 === fe.indexOf('Android 4.0')) ||
          -1 === fe.indexOf('Mobile Safari') ||
          -1 !== fe.indexOf('Chrome') ||
          -1 !== fe.indexOf('Windows Phone')) &&
        window.history &&
        'function' == typeof window.history.pushState;
    function ve(e, t) {
      pe();
      var n = window.history;
      try {
        if (t) {
          var a = r({}, n.state);
          (a.key = ae()), n.replaceState(a, '', e);
        } else n.pushState({ key: re(te()) }, '', e);
      } catch (n) {
        window.location[t ? 'replace' : 'assign'](e);
      }
    }
    function ge(e) {
      ve(e, !0);
    }
    function Te(e, t, n) {
      var a = function (r) {
        r >= e.length
          ? n()
          : e[r]
          ? t(e[r], function () {
              a(r + 1);
            })
          : a(r + 1);
      };
      a(0);
    }
    var be = { redirected: 2, aborted: 4, cancelled: 8, duplicated: 16 };
    function we(e, t) {
      return Ae(
        e,
        t,
        be.redirected,
        'Redirected when going from "' +
          e.fullPath +
          '" to "' +
          (function (e) {
            if ('string' == typeof e) return e;
            if ('path' in e) return e.path;
            var t = {};
            return (
              _e.forEach(function (n) {
                n in e && (t[n] = e[n]);
              }),
              JSON.stringify(t, null, 2)
            );
          })(t) +
          '" via a navigation guard.',
      );
    }
    function ke(e, t) {
      return Ae(
        e,
        t,
        be.cancelled,
        'Navigation cancelled from "' +
          e.fullPath +
          '" to "' +
          t.fullPath +
          '" with a new navigation.',
      );
    }
    function Ae(e, t, n, a) {
      var r = new Error(a);
      return (r._isRouter = !0), (r.from = e), (r.to = t), (r.type = n), r;
    }
    var _e = ['params', 'query', 'hash'];
    function xe(e) {
      return Object.prototype.toString.call(e).indexOf('Error') > -1;
    }
    function Oe(e, t) {
      return xe(e) && e._isRouter && (null == t || e.type === t);
    }
    function Se(e) {
      return function (t, n, a) {
        var r = !1,
          s = 0,
          o = null;
        Ce(e, function (e, t, n, i) {
          if ('function' == typeof e && void 0 === e.cid) {
            (r = !0), s++;
            var p,
              u = $e(function (t) {
                var r;
                ((r = t).__esModule || (Me && 'Module' === r[Symbol.toStringTag])) &&
                  (t = t.default),
                  (e.resolved = 'function' == typeof t ? t : q.extend(t)),
                  (n.components[i] = t),
                  --s <= 0 && a();
              }),
              l = $e(function (e) {
                var t = 'Failed to resolve async component ' + i + ': ' + e;
                o || ((o = xe(e) ? e : new Error(t)), a(o));
              });
            try {
              p = e(u, l);
            } catch (e) {
              l(e);
            }
            if (p)
              if ('function' == typeof p.then) p.then(u, l);
              else {
                var d = p.component;
                d && 'function' == typeof d.then && d.then(u, l);
              }
          }
        }),
          r || a();
      };
    }
    function Ce(e, t) {
      return Be(
        e.map(function (e) {
          return Object.keys(e.components).map(function (n) {
            return t(e.components[n], e.instances[n], e, n);
          });
        }),
      );
    }
    function Be(e) {
      return Array.prototype.concat.apply([], e);
    }
    var Me = 'function' == typeof Symbol && 'symbol' == typeof Symbol.toStringTag;
    function $e(e) {
      var t = !1;
      return function () {
        for (var n = [], a = arguments.length; a--; ) n[a] = arguments[a];
        if (!t) return (t = !0), e.apply(this, n);
      };
    }
    var Pe = function (e, t) {
      (this.router = e),
        (this.base = (function (e) {
          if (!e)
            if (Z) {
              var t = document.querySelector('base');
              e = (e = (t && t.getAttribute('href')) || '/').replace(/^https?:\/\/[^\/]+/, '');
            } else e = '/';
          '/' !== e.charAt(0) && (e = '/' + e);
          return e.replace(/\/$/, '');
        })(t)),
        (this.current = h),
        (this.pending = null),
        (this.ready = !1),
        (this.readyCbs = []),
        (this.readyErrorCbs = []),
        (this.errorCbs = []),
        (this.listeners = []);
    };
    function Fe(e, t, n, a) {
      var r = Ce(e, function (e, a, r, s) {
        var o = (function (e, t) {
          'function' != typeof e && (e = q.extend(e));
          return e.options[t];
        })(e, t);
        if (o)
          return Array.isArray(o)
            ? o.map(function (e) {
                return n(e, a, r, s);
              })
            : n(o, a, r, s);
      });
      return Be(a ? r.reverse() : r);
    }
    function Ee(e, t) {
      if (t)
        return function () {
          return e.apply(t, arguments);
        };
    }
    (Pe.prototype.listen = function (e) {
      this.cb = e;
    }),
      (Pe.prototype.onReady = function (e, t) {
        this.ready ? e() : (this.readyCbs.push(e), t && this.readyErrorCbs.push(t));
      }),
      (Pe.prototype.onError = function (e) {
        this.errorCbs.push(e);
      }),
      (Pe.prototype.transitionTo = function (e, t, n) {
        var a,
          r = this;
        try {
          a = this.router.match(e, this.current);
        } catch (e) {
          throw (
            (this.errorCbs.forEach(function (t) {
              t(e);
            }),
            e)
          );
        }
        var s = this.current;
        this.confirmTransition(
          a,
          function () {
            r.updateRoute(a),
              t && t(a),
              r.ensureURL(),
              r.router.afterHooks.forEach(function (e) {
                e && e(a, s);
              }),
              r.ready ||
                ((r.ready = !0),
                r.readyCbs.forEach(function (e) {
                  e(a);
                }));
          },
          function (e) {
            n && n(e),
              e &&
                !r.ready &&
                ((Oe(e, be.redirected) && s === h) ||
                  ((r.ready = !0),
                  r.readyErrorCbs.forEach(function (t) {
                    t(e);
                  })));
          },
        );
      }),
      (Pe.prototype.confirmTransition = function (e, t, n) {
        var a = this,
          r = this.current;
        this.pending = e;
        var s,
          o,
          i = function (e) {
            !Oe(e) &&
              xe(e) &&
              (a.errorCbs.length
                ? a.errorCbs.forEach(function (t) {
                    t(e);
                  })
                : console.error(e)),
              n && n(e);
          },
          p = e.matched.length - 1,
          u = r.matched.length - 1;
        if (T(e, r) && p === u && e.matched[p] === r.matched[u])
          return (
            this.ensureURL(),
            i(
              (((o = Ae(
                (s = r),
                e,
                be.duplicated,
                'Avoided redundant navigation to current location: "' + s.fullPath + '".',
              )).name = 'NavigationDuplicated'),
              o),
            )
          );
        var l = (function (e, t) {
            var n,
              a = Math.max(e.length, t.length);
            for (n = 0; n < a && e[n] === t[n]; n++);
            return { updated: t.slice(0, n), activated: t.slice(n), deactivated: e.slice(n) };
          })(this.current.matched, e.matched),
          d = l.updated,
          c = l.deactivated,
          y = l.activated,
          m = [].concat(
            (function (e) {
              return Fe(e, 'beforeRouteLeave', Ee, !0);
            })(c),
            this.router.beforeHooks,
            (function (e) {
              return Fe(e, 'beforeRouteUpdate', Ee);
            })(d),
            y.map(function (e) {
              return e.beforeEnter;
            }),
            Se(y),
          ),
          f = function (t, n) {
            if (a.pending !== e) return i(ke(r, e));
            try {
              t(e, r, function (t) {
                !1 === t
                  ? (a.ensureURL(!0),
                    i(
                      (function (e, t) {
                        return Ae(
                          e,
                          t,
                          be.aborted,
                          'Navigation aborted from "' +
                            e.fullPath +
                            '" to "' +
                            t.fullPath +
                            '" via a navigation guard.',
                        );
                      })(r, e),
                    ))
                  : xe(t)
                  ? (a.ensureURL(!0), i(t))
                  : 'string' == typeof t ||
                    ('object' == typeof t &&
                      ('string' == typeof t.path || 'string' == typeof t.name))
                  ? (i(we(r, e)), 'object' == typeof t && t.replace ? a.replace(t) : a.push(t))
                  : n(t);
              });
            } catch (e) {
              i(e);
            }
          };
        Te(m, f, function () {
          Te(
            (function (e) {
              return Fe(e, 'beforeRouteEnter', function (e, t, n, a) {
                return (function (e, t, n) {
                  return function (a, r, s) {
                    return e(a, r, function (e) {
                      'function' == typeof e &&
                        (t.enteredCbs[n] || (t.enteredCbs[n] = []), t.enteredCbs[n].push(e)),
                        s(e);
                    });
                  };
                })(e, n, a);
              });
            })(y).concat(a.router.resolveHooks),
            f,
            function () {
              if (a.pending !== e) return i(ke(r, e));
              (a.pending = null),
                t(e),
                a.router.app &&
                  a.router.app.$nextTick(function () {
                    w(e);
                  });
            },
          );
        });
      }),
      (Pe.prototype.updateRoute = function (e) {
        (this.current = e), this.cb && this.cb(e);
      }),
      (Pe.prototype.setupListeners = function () {}),
      (Pe.prototype.teardown = function () {
        this.listeners.forEach(function (e) {
          e();
        }),
          (this.listeners = []),
          (this.current = h),
          (this.pending = null);
      });
    var Ie = (function (e) {
      function t(t, n) {
        e.call(this, t, n), (this._startLocation = Ne(this.base));
      }
      return (
        e && (t.__proto__ = e),
        (t.prototype = Object.create(e && e.prototype)),
        (t.prototype.constructor = t),
        (t.prototype.setupListeners = function () {
          var e = this;
          if (!(this.listeners.length > 0)) {
            var t = this.router,
              n = t.options.scrollBehavior,
              a = he && n;
            a && this.listeners.push(oe());
            var r = function () {
              var n = e.current,
                r = Ne(e.base);
              (e.current === h && r === e._startLocation) ||
                e.transitionTo(r, function (e) {
                  a && ie(t, e, n, !0);
                });
            };
            window.addEventListener('popstate', r),
              this.listeners.push(function () {
                window.removeEventListener('popstate', r);
              });
          }
        }),
        (t.prototype.go = function (e) {
          window.history.go(e);
        }),
        (t.prototype.push = function (e, t, n) {
          var a = this,
            r = this.current;
          this.transitionTo(
            e,
            function (e) {
              ve(x(a.base + e.fullPath)), ie(a.router, e, r, !1), t && t(e);
            },
            n,
          );
        }),
        (t.prototype.replace = function (e, t, n) {
          var a = this,
            r = this.current;
          this.transitionTo(
            e,
            function (e) {
              ge(x(a.base + e.fullPath)), ie(a.router, e, r, !1), t && t(e);
            },
            n,
          );
        }),
        (t.prototype.ensureURL = function (e) {
          if (Ne(this.base) !== this.current.fullPath) {
            var t = x(this.base + this.current.fullPath);
            e ? ve(t) : ge(t);
          }
        }),
        (t.prototype.getCurrentLocation = function () {
          return Ne(this.base);
        }),
        t
      );
    })(Pe);
    function Ne(e) {
      var t = window.location.pathname;
      return (
        e && 0 === t.toLowerCase().indexOf(e.toLowerCase()) && (t = t.slice(e.length)),
        (t || '/') + window.location.search + window.location.hash
      );
    }
    var Re = (function (e) {
      function t(t, n, a) {
        e.call(this, t, n),
          (a &&
            (function (e) {
              var t = Ne(e);
              if (!/^\/#/.test(t)) return window.location.replace(x(e + '/#' + t)), !0;
            })(this.base)) ||
            je();
      }
      return (
        e && (t.__proto__ = e),
        (t.prototype = Object.create(e && e.prototype)),
        (t.prototype.constructor = t),
        (t.prototype.setupListeners = function () {
          var e = this;
          if (!(this.listeners.length > 0)) {
            var t = this.router.options.scrollBehavior,
              n = he && t;
            n && this.listeners.push(oe());
            var a = function () {
                var t = e.current;
                je() &&
                  e.transitionTo(De(), function (a) {
                    n && ie(e.router, a, t, !0), he || He(a.fullPath);
                  });
              },
              r = he ? 'popstate' : 'hashchange';
            window.addEventListener(r, a),
              this.listeners.push(function () {
                window.removeEventListener(r, a);
              });
          }
        }),
        (t.prototype.push = function (e, t, n) {
          var a = this,
            r = this.current;
          this.transitionTo(
            e,
            function (e) {
              Ue(e.fullPath), ie(a.router, e, r, !1), t && t(e);
            },
            n,
          );
        }),
        (t.prototype.replace = function (e, t, n) {
          var a = this,
            r = this.current;
          this.transitionTo(
            e,
            function (e) {
              He(e.fullPath), ie(a.router, e, r, !1), t && t(e);
            },
            n,
          );
        }),
        (t.prototype.go = function (e) {
          window.history.go(e);
        }),
        (t.prototype.ensureURL = function (e) {
          var t = this.current.fullPath;
          De() !== t && (e ? Ue(t) : He(t));
        }),
        (t.prototype.getCurrentLocation = function () {
          return De();
        }),
        t
      );
    })(Pe);
    function je() {
      var e = De();
      return '/' === e.charAt(0) || (He('/' + e), !1);
    }
    function De() {
      var e = window.location.href,
        t = e.indexOf('#');
      return t < 0 ? '' : (e = e.slice(t + 1));
    }
    function Le(e) {
      var t = window.location.href,
        n = t.indexOf('#');
      return (n >= 0 ? t.slice(0, n) : t) + '#' + e;
    }
    function Ue(e) {
      he ? ve(Le(e)) : (window.location.hash = e);
    }
    function He(e) {
      he ? ge(Le(e)) : window.location.replace(Le(e));
    }
    var Ve = (function (e) {
        function t(t, n) {
          e.call(this, t, n), (this.stack = []), (this.index = -1);
        }
        return (
          e && (t.__proto__ = e),
          (t.prototype = Object.create(e && e.prototype)),
          (t.prototype.constructor = t),
          (t.prototype.push = function (e, t, n) {
            var a = this;
            this.transitionTo(
              e,
              function (e) {
                (a.stack = a.stack.slice(0, a.index + 1).concat(e)), a.index++, t && t(e);
              },
              n,
            );
          }),
          (t.prototype.replace = function (e, t, n) {
            var a = this;
            this.transitionTo(
              e,
              function (e) {
                (a.stack = a.stack.slice(0, a.index).concat(e)), t && t(e);
              },
              n,
            );
          }),
          (t.prototype.go = function (e) {
            var t = this,
              n = this.index + e;
            if (!(n < 0 || n >= this.stack.length)) {
              var a = this.stack[n];
              this.confirmTransition(
                a,
                function () {
                  var e = t.current;
                  (t.index = n),
                    t.updateRoute(a),
                    t.router.afterHooks.forEach(function (t) {
                      t && t(a, e);
                    });
                },
                function (e) {
                  Oe(e, be.duplicated) && (t.index = n);
                },
              );
            }
          }),
          (t.prototype.getCurrentLocation = function () {
            var e = this.stack[this.stack.length - 1];
            return e ? e.fullPath : '/';
          }),
          (t.prototype.ensureURL = function () {}),
          t
        );
      })(Pe),
      ze = function (e) {
        void 0 === e && (e = {}),
          (this.app = null),
          (this.apps = []),
          (this.options = e),
          (this.beforeHooks = []),
          (this.resolveHooks = []),
          (this.afterHooks = []),
          (this.matcher = Y(e.routes || [], this));
        var t = e.mode || 'hash';
        switch (
          ((this.fallback = 'history' === t && !he && !1 !== e.fallback),
          this.fallback && (t = 'hash'),
          Z || (t = 'abstract'),
          (this.mode = t),
          t)
        ) {
          case 'history':
            this.history = new Ie(this, e.base);
            break;
          case 'hash':
            this.history = new Re(this, e.base, this.fallback);
            break;
          case 'abstract':
            this.history = new Ve(this, e.base);
            break;
          default:
            0;
        }
      },
      qe = { currentRoute: { configurable: !0 } };
    function We(e, t) {
      return (
        e.push(t),
        function () {
          var n = e.indexOf(t);
          n > -1 && e.splice(n, 1);
        }
      );
    }
    (ze.prototype.match = function (e, t, n) {
      return this.matcher.match(e, t, n);
    }),
      (qe.currentRoute.get = function () {
        return this.history && this.history.current;
      }),
      (ze.prototype.init = function (e) {
        var t = this;
        if (
          (this.apps.push(e),
          e.$once('hook:destroyed', function () {
            var n = t.apps.indexOf(e);
            n > -1 && t.apps.splice(n, 1),
              t.app === e && (t.app = t.apps[0] || null),
              t.app || t.history.teardown();
          }),
          !this.app)
        ) {
          this.app = e;
          var n = this.history;
          if (n instanceof Ie || n instanceof Re) {
            var a = function (e) {
              n.setupListeners(),
                (function (e) {
                  var a = n.current,
                    r = t.options.scrollBehavior;
                  he && r && 'fullPath' in e && ie(t, e, a, !1);
                })(e);
            };
            n.transitionTo(n.getCurrentLocation(), a, a);
          }
          n.listen(function (e) {
            t.apps.forEach(function (t) {
              t._route = e;
            });
          });
        }
      }),
      (ze.prototype.beforeEach = function (e) {
        return We(this.beforeHooks, e);
      }),
      (ze.prototype.beforeResolve = function (e) {
        return We(this.resolveHooks, e);
      }),
      (ze.prototype.afterEach = function (e) {
        return We(this.afterHooks, e);
      }),
      (ze.prototype.onReady = function (e, t) {
        this.history.onReady(e, t);
      }),
      (ze.prototype.onError = function (e) {
        this.history.onError(e);
      }),
      (ze.prototype.push = function (e, t, n) {
        var a = this;
        if (!t && !n && 'undefined' != typeof Promise)
          return new Promise(function (t, n) {
            a.history.push(e, t, n);
          });
        this.history.push(e, t, n);
      }),
      (ze.prototype.replace = function (e, t, n) {
        var a = this;
        if (!t && !n && 'undefined' != typeof Promise)
          return new Promise(function (t, n) {
            a.history.replace(e, t, n);
          });
        this.history.replace(e, t, n);
      }),
      (ze.prototype.go = function (e) {
        this.history.go(e);
      }),
      (ze.prototype.back = function () {
        this.go(-1);
      }),
      (ze.prototype.forward = function () {
        this.go(1);
      }),
      (ze.prototype.getMatchedComponents = function (e) {
        var t = e ? (e.matched ? e : this.resolve(e).route) : this.currentRoute;
        return t
          ? [].concat.apply(
              [],
              t.matched.map(function (e) {
                return Object.keys(e.components).map(function (t) {
                  return e.components[t];
                });
              }),
            )
          : [];
      }),
      (ze.prototype.resolve = function (e, t, n) {
        var a = z(e, (t = t || this.history.current), n, this),
          r = this.match(a, t),
          s = r.redirectedFrom || r.fullPath;
        return {
          location: a,
          route: r,
          href: (function (e, t, n) {
            var a = 'hash' === n ? '#' + t : t;
            return e ? x(e + '/' + a) : a;
          })(this.history.base, s, this.mode),
          normalizedTo: a,
          resolved: r,
        };
      }),
      (ze.prototype.getRoutes = function () {
        return this.matcher.getRoutes();
      }),
      (ze.prototype.addRoute = function (e, t) {
        this.matcher.addRoute(e, t),
          this.history.current !== h &&
            this.history.transitionTo(this.history.getCurrentLocation());
      }),
      (ze.prototype.addRoutes = function (e) {
        this.matcher.addRoutes(e),
          this.history.current !== h &&
            this.history.transitionTo(this.history.getCurrentLocation());
      }),
      Object.defineProperties(ze.prototype, qe),
      (ze.install = function e(t) {
        if (!e.installed || q !== t) {
          (e.installed = !0), (q = t);
          var n = function (e) {
              return void 0 !== e;
            },
            a = function (e, t) {
              var a = e.$options._parentVnode;
              n(a) && n((a = a.data)) && n((a = a.registerRouteInstance)) && a(e, t);
            };
          t.mixin({
            beforeCreate: function () {
              n(this.$options.router)
                ? ((this._routerRoot = this),
                  (this._router = this.$options.router),
                  this._router.init(this),
                  t.util.defineReactive(this, '_route', this._router.history.current))
                : (this._routerRoot = (this.$parent && this.$parent._routerRoot) || this),
                a(this, this);
            },
            destroyed: function () {
              a(this);
            },
          }),
            Object.defineProperty(t.prototype, '$router', {
              get: function () {
                return this._routerRoot._router;
              },
            }),
            Object.defineProperty(t.prototype, '$route', {
              get: function () {
                return this._routerRoot._route;
              },
            }),
            t.component('RouterView', k),
            t.component('RouterLink', K);
          var r = t.config.optionMergeStrategies;
          r.beforeRouteEnter = r.beforeRouteLeave = r.beforeRouteUpdate = r.created;
        }
      }),
      (ze.version = '3.5.1'),
      (ze.isNavigationFailure = Oe),
      (ze.NavigationFailureType = be),
      (ze.START_LOCATION = h),
      Z && window.Vue && window.Vue.use(ze);
    var Ke = ze,
      Je = function () {
        var e = this.$createElement,
          t = this._self._c || e;
        return t(
          'div',
          { staticClass: 'min-h-screen bg-gray-100 px-4 pt-6' },
          [t('router-view')],
          1,
        );
      };
    Je._withStripped = !0;
    n(4);
    function Ze(e, t, n, a, r, s, o, i) {
      var p,
        u = 'function' == typeof e ? e.options : e;
      if (
        (t && ((u.render = t), (u.staticRenderFns = n), (u._compiled = !0)),
        a && (u.functional = !0),
        s && (u._scopeId = 'data-v-' + s),
        o
          ? ((p = function (e) {
              (e =
                e ||
                (this.$vnode && this.$vnode.ssrContext) ||
                (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext)) ||
                'undefined' == typeof __VUE_SSR_CONTEXT__ ||
                (e = __VUE_SSR_CONTEXT__),
                r && r.call(this, e),
                e && e._registeredComponents && e._registeredComponents.add(o);
            }),
            (u._ssrRegister = p))
          : r &&
            (p = i
              ? function () {
                  r.call(this, (u.functional ? this.parent : this).$root.$options.shadowRoot);
                }
              : r),
        p)
      )
        if (u.functional) {
          u._injectStyles = p;
          var l = u.render;
          u.render = function (e, t) {
            return p.call(t), l(e, t);
          };
        } else {
          var d = u.beforeCreate;
          u.beforeCreate = d ? [].concat(d, p) : [p];
        }
      return { exports: e, options: u };
    }
    var Ge = Ze({}, Je, [], !1, null, null, null);
    Ge.options.__file = 'node_modules/hardhat-docgen/src/App.vue';
    var Xe = Ge.exports,
      Ye = function () {
        var e = this,
          t = e.$createElement,
          n = e._self._c || t;
        return n(
          'div',
          { staticClass: 'w-full space-y-10 md:max-w-screen-sm lg:max-w-screen-md mx-auto' },
          [
            n('HeaderBar'),
            e._v(' '),
            n(
              'div',
              { staticClass: 'pb-32' },
              [
                n('div', { staticClass: 'space-y-4' }, [
                  n('span', { staticClass: 'text-lg' }, [
                    e._v('\n        ' + e._s(e.json.source) + '\n      '),
                  ]),
                  e._v(' '),
                  n('h1', { staticClass: 'text-xl' }, [
                    e._v('\n        ' + e._s(e.json.name) + '\n      '),
                  ]),
                  e._v(' '),
                  n('h2', { staticClass: 'text-lg' }, [
                    e._v('\n        ' + e._s(e.json.title) + '\n      '),
                  ]),
                  e._v(' '),
                  n('h2', { staticClass: 'text-lg' }, [
                    e._v('\n        ' + e._s(e.json.author) + '\n      '),
                  ]),
                  e._v(' '),
                  n('p', [e._v(e._s(e.json.notice))]),
                  e._v(' '),
                  n('p', [e._v(e._s(e.json.details))]),
                ]),
                e._v(' '),
                n(
                  'div',
                  { staticClass: 'mt-8' },
                  [
                    e.json.hasOwnProperty('constructor')
                      ? n('Member', { attrs: { json: e.json.constructor } })
                      : e._e(),
                  ],
                  1,
                ),
                e._v(' '),
                n(
                  'div',
                  { staticClass: 'mt-8' },
                  [e.json.receive ? n('Member', { attrs: { json: e.json.receive } }) : e._e()],
                  1,
                ),
                e._v(' '),
                n(
                  'div',
                  { staticClass: 'mt-8' },
                  [e.json.fallback ? n('Member', { attrs: { json: e.json.fallback } }) : e._e()],
                  1,
                ),
                e._v(' '),
                e.json.events
                  ? n('MemberSet', { attrs: { title: 'Events', json: e.json.events } })
                  : e._e(),
                e._v(' '),
                e.json.stateVariables
                  ? n('MemberSet', {
                      attrs: { title: 'State Variables', json: e.json.stateVariables },
                    })
                  : e._e(),
                e._v(' '),
                e.json.methods
                  ? n('MemberSet', { attrs: { title: 'Methods', json: e.json.methods } })
                  : e._e(),
              ],
              1,
            ),
            e._v(' '),
            n('FooterBar'),
          ],
          1,
        );
      };
    Ye._withStripped = !0;
    var Qe = function () {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return n(
        'div',
        {
          staticClass:
            'bg-gray-100 fixed bottom-0 right-0 w-full border-t border-dashed border-gray-300',
        },
        [
          n(
            'div',
            {
              staticClass: 'w-full text-center py-2 md:max-w-screen-sm lg:max-w-screen-md mx-auto',
            },
            [
              n(
                'button',
                {
                  staticClass: 'py-1 px-2 text-gray-500',
                  on: {
                    click: function (t) {
                      return e.openLink(e.repository);
                    },
                  },
                },
                [e._v('\n      built with ' + e._s(e.name) + '\n    ')],
              ),
            ],
          ),
        ],
      );
    };
    Qe._withStripped = !0;
    var et = n(2),
      tt = Ze(
        {
          data: function () {
            return { repository: et.b, name: et.a };
          },
          methods: {
            openLink(e) {
              window.open(e, '_blank');
            },
          },
        },
        Qe,
        [],
        !1,
        null,
        null,
        null,
      );
    tt.options.__file = 'node_modules/hardhat-docgen/src/components/FooterBar.vue';
    var nt = tt.exports,
      at = function () {
        var e = this.$createElement,
          t = this._self._c || e;
        return t(
          'div',
          { staticClass: 'w-full border-b border-dashed py-2 border-gray-300' },
          [
            t('router-link', { staticClass: 'py-2 text-gray-500', attrs: { to: '/' } }, [
              this._v('\n    <- Go back\n  '),
            ]),
          ],
          1,
        );
      };
    at._withStripped = !0;
    var rt = Ze({}, at, [], !1, null, null, null);
    rt.options.__file = 'node_modules/hardhat-docgen/src/components/HeaderBar.vue';
    var st = rt.exports,
      ot = function () {
        var e = this,
          t = e.$createElement,
          n = e._self._c || t;
        return n('div', { staticClass: 'border-2 border-gray-400 border-dashed w-full p-2' }, [
          n('h3', { staticClass: 'text-lg pb-2 mb-2 border-b-2 border-gray-400 border-dashed' }, [
            e._v(
              '\n    ' +
                e._s(e.name) +
                ' ' +
                e._s(e.keywords) +
                ' ' +
                e._s(e.inputSignature) +
                '\n  ',
            ),
          ]),
          e._v(' '),
          n(
            'div',
            { staticClass: 'space-y-3' },
            [
              n('p', [e._v(e._s(e.json.notice))]),
              e._v(' '),
              n('p', [e._v(e._s(e.json.details))]),
              e._v(' '),
              n('MemberSection', { attrs: { name: 'Parameters', items: e.inputs } }),
              e._v(' '),
              n('MemberSection', { attrs: { name: 'Return Values', items: e.outputs } }),
            ],
            1,
          ),
        ]);
      };
    ot._withStripped = !0;
    var it = function () {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.items.length > 0
        ? n(
            'ul',
            [
              n('h4', { staticClass: 'text-lg' }, [e._v('\n    ' + e._s(e.name) + '\n  ')]),
              e._v(' '),
              e._l(e.items, function (t, a) {
                return n('li', { key: a }, [
                  n('span', { staticClass: 'bg-gray-300' }, [e._v(e._s(t.type))]),
                  e._v(' '),
                  n('b', [e._v(e._s(t.name || '_' + a))]),
                  t.desc ? n('span', [e._v(': '), n('i', [e._v(e._s(t.desc))])]) : e._e(),
                ]);
              }),
            ],
            2,
          )
        : e._e();
    };
    it._withStripped = !0;
    var pt = Ze(
      {
        props: {
          name: { type: String, default: '' },
          items: { type: Array, default: () => new Array() },
        },
      },
      it,
      [],
      !1,
      null,
      null,
      null,
    );
    pt.options.__file = 'node_modules/hardhat-docgen/src/components/MemberSection.vue';
    var ut = Ze(
      {
        components: { MemberSection: pt.exports },
        props: { json: { type: Object, default: () => new Object() } },
        computed: {
          name: function () {
            return this.json.name || this.json.type;
          },
          keywords: function () {
            let e = [];
            return (
              this.json.stateMutability && e.push(this.json.stateMutability),
              'true' === this.json.anonymous && e.push('anonymous'),
              e.join(' ')
            );
          },
          params: function () {
            return this.json.params || {};
          },
          returns: function () {
            return this.json.returns || {};
          },
          inputs: function () {
            return (this.json.inputs || []).map((e) => ({ ...e, desc: this.params[e.name] }));
          },
          inputSignature: function () {
            return `(${this.inputs.map((e) => e.type).join(',')})`;
          },
          outputs: function () {
            return (this.json.outputs || []).map((e, t) => ({
              ...e,
              desc: this.returns[e.name || '_' + t],
            }));
          },
          outputSignature: function () {
            return `(${this.outputs.map((e) => e.type).join(',')})`;
          },
        },
      },
      ot,
      [],
      !1,
      null,
      null,
      null,
    );
    ut.options.__file = 'node_modules/hardhat-docgen/src/components/Member.vue';
    var lt = ut.exports,
      dt = function () {
        var e = this,
          t = e.$createElement,
          n = e._self._c || t;
        return n(
          'div',
          { staticClass: 'w-full mt-8' },
          [
            n('h2', { staticClass: 'text-lg' }, [e._v(e._s(e.title))]),
            e._v(' '),
            e._l(Object.keys(e.json), function (t) {
              return n('Member', { key: t, staticClass: 'mt-3', attrs: { json: e.json[t] } });
            }),
          ],
          2,
        );
      };
    dt._withStripped = !0;
    var ct = Ze(
      {
        components: { Member: lt },
        props: {
          title: { type: String, default: '' },
          json: { type: Object, default: () => new Object() },
        },
      },
      dt,
      [],
      !1,
      null,
      null,
      null,
    );
    ct.options.__file = 'node_modules/hardhat-docgen/src/components/MemberSet.vue';
    var yt = Ze(
      {
        components: { Member: lt, MemberSet: ct.exports, HeaderBar: st, FooterBar: nt },
        props: { json: { type: Object, default: () => new Object() } },
      },
      Ye,
      [],
      !1,
      null,
      null,
      null,
    );
    yt.options.__file = 'node_modules/hardhat-docgen/src/components/Contract.vue';
    var mt = yt.exports,
      ft = function () {
        var e = this.$createElement,
          t = this._self._c || e;
        return t(
          'div',
          { staticClass: 'w-full space-y-10 md:max-w-screen-sm lg:max-w-screen-md mx-auto pb-32' },
          [
            t('Branch', { attrs: { json: this.trees, name: 'Sources:' } }),
            this._v(' '),
            t('FooterBar', { staticClass: 'mt-20' }),
          ],
          1,
        );
      };
    ft._withStripped = !0;
    var ht = function () {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return n('div', [
        e._v('\n  ' + e._s(e.name) + '\n  '),
        Array.isArray(e.json)
          ? n(
              'div',
              { staticClass: 'pl-5' },
              e._l(e.json, function (t, a) {
                return n(
                  'div',
                  { key: a },
                  [
                    n('router-link', { attrs: { to: t.source + ':' + t.name } }, [
                      e._v('\n        ' + e._s(t.name) + '\n      '),
                    ]),
                  ],
                  1,
                );
              }),
              0,
            )
          : n(
              'div',
              { staticClass: 'pl-5' },
              e._l(Object.keys(e.json), function (t) {
                return n(
                  'div',
                  { key: t },
                  [n('Branch', { attrs: { json: e.json[t], name: t } })],
                  1,
                );
              }),
              0,
            ),
      ]);
    };
    ht._withStripped = !0;
    var vt = Ze(
      {
        name: 'Branch',
        props: {
          name: { type: String, default: null },
          json: { type: [Object, Array], default: () => new Object() },
        },
      },
      ht,
      [],
      !1,
      null,
      null,
      null,
    );
    vt.options.__file = 'node_modules/hardhat-docgen/src/components/Branch.vue';
    var gt = Ze(
      {
        components: { Branch: vt.exports, FooterBar: nt },
        props: { json: { type: Object, default: () => new Object() } },
        computed: {
          trees: function () {
            let e = {};
            for (let t in this.json)
              t.replace('/', '//')
                .split(/\/(?=[^\/])/)
                .reduce(
                  function (e, n) {
                    if (!n.includes(':')) return (e[n] = e[n] || {}), e[n];
                    {
                      let [a] = n.split(':');
                      (e[a] = e[a] || []), e[a].push(this.json[t]);
                    }
                  }.bind(this),
                  e,
                );
            return e;
          },
        },
      },
      ft,
      [],
      !1,
      null,
      null,
      null,
    );
    gt.options.__file = 'node_modules/hardhat-docgen/src/components/Index.vue';
    var Tt = gt.exports;
    a.a.use(Ke);
    const bt = {
        'contracts/callers/BaseCaller.sol:BaseCaller': {
          source: 'contracts/callers/BaseCaller.sol',
          name: 'BaseCaller',
          title: 'Base caller that provides `getAccount` function.',
        },
        'contracts/callers/UniswapCaller.sol:UniswapCaller': {
          source: 'contracts/callers/UniswapCaller.sol',
          name: 'UniswapCaller',
          title: 'Uniswap caller that executes swaps on UniswapV2-like pools.',
          methods: {
            'callBytes(bytes)': {
              inputs: [{ internalType: 'bytes', name: 'callerCallData', type: 'bytes' }],
              name: 'callBytes',
              outputs: [],
              stateMutability: 'payable',
              type: 'function',
              details: 'Implementation of Caller interface function.',
              params: {
                callerCallData:
                  'ABI-encoded parameters:     - pairs Array of uniswap-like pairs;     - directions Array of exchange directions (`true` means token0 -> token1);     - swapType Whether input of output amount is fixed;     - amount Amount of the token which is fixed (see swapType).',
              },
              notice:
                'Main external function:     executes swap using Uniswap-like pools and returns tokens to the account.',
            },
            'getExactInputAmount(bytes)': {
              inputs: [{ internalType: 'bytes', name: 'callerCallData', type: 'bytes' }],
              name: 'getExactInputAmount',
              outputs: [
                { internalType: 'uint256', name: 'exactAbsoluteInputAmount', type: 'uint256' },
              ],
              stateMutability: 'view',
              type: 'function',
              details: 'Implementation of Caller interface function.',
              params: {
                callerCallData:
                  'ABI-encoded parameters:     - pairs Array of uniswap-like pairs;     - directions Array of exchange directions (`true` means token0 -> token1);     - swapType Whether inputs of outputs are fixed;     - amount Amount of token which is fixed (see swapType);     - account The address that will receive tokens after the last swap.',
              },
              returns: { exactAbsoluteInputAmount: 'The exact amount of the input tokens.' },
              notice:
                'Returns the exact amount of the input tokens in case of fixed output amount.',
            },
          },
        },
        'contracts/callers/ZerionCaller.sol:ZerionCaller': {
          source: 'contracts/callers/ZerionCaller.sol',
          name: 'ZerionCaller',
          title: 'Zerion caller that executes actions.',
          constructor: {
            inputs: [
              { internalType: 'address', name: 'protocolAdapterRegistry', type: 'address' },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
          },
          events: {
            'ExecutedAction(bytes32,uint8,(address,uint256,uint8)[],bytes)': {
              anonymous: !1,
              inputs: [
                {
                  indexed: !0,
                  internalType: 'bytes32',
                  name: 'protocolAdapterName',
                  type: 'bytes32',
                },
                {
                  indexed: !0,
                  internalType: 'enum ActionType',
                  name: 'actionType',
                  type: 'uint8',
                },
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                  ],
                  indexed: !1,
                  internalType: 'struct TokenAmount[]',
                  name: 'tokenAmounts',
                  type: 'tuple[]',
                },
                { indexed: !1, internalType: 'bytes', name: 'data', type: 'bytes' },
              ],
              name: 'ExecutedAction',
              type: 'event',
              params: {
                actionType: 'Type of action: deposit or withdraw.',
                data: 'ABI-encoded additional parameters.',
                protocolAdapterName: 'Name of protocol adapter.',
                tokenAmounts: 'Array of TokenAmount structs for the tokens used in this action.',
              },
              notice: 'Emits action info.',
            },
          },
          methods: {
            'callBytes(bytes)': {
              inputs: [{ internalType: 'bytes', name: 'callerCallData', type: 'bytes' }],
              name: 'callBytes',
              outputs: [],
              stateMutability: 'payable',
              type: 'function',
              params: {
                callerCallData:
                  'ABI-encoded parameters:     - actions Array with actions to be executed.',
              },
              notice:
                'Main external function:     executes actions and returns tokens to the account.',
            },
            'executeExternal((bytes32,uint8,(address,uint256,uint8)[],bytes))': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'protocolAdapterName', type: 'bytes32' },
                    { internalType: 'enum ActionType', name: 'actionType', type: 'uint8' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'uint256', name: 'amount', type: 'uint256' },
                        { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                      ],
                      internalType: 'struct TokenAmount[]',
                      name: 'tokenAmounts',
                      type: 'tuple[]',
                    },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                  ],
                  internalType: 'struct Action',
                  name: 'action',
                  type: 'tuple',
                },
              ],
              name: 'executeExternal',
              outputs: [
                { internalType: 'address[]', name: 'tokensToBeWithdrawn', type: 'address[]' },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                'Can be called only by this contract. This function is used to create cross-protocol adapters.',
              params: { action: 'Action struct.' },
              returns: { tokensToBeWithdrawn: 'Array of tokens to be returned to the account.' },
              notice: 'Executes one action via external call.',
            },
            'getExactInputAmount(bytes)': {
              inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
              name: 'getExactInputAmount',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'pure',
              type: 'function',
              details: 'Implementation of Caller interface function.',
              notice: 'Always reverts as there is no fixed outputs case.',
            },
            'getProtocolAdapterRegistry()': {
              inputs: [],
              name: 'getProtocolAdapterRegistry',
              outputs: [
                { internalType: 'address', name: 'protocolAdapterRegistry', type: 'address' },
              ],
              stateMutability: 'view',
              type: 'function',
              returns: {
                protocolAdapterRegistry: 'Address of the ProtocolAdapterRegistry contract used.',
              },
            },
          },
        },
        'contracts/interactiveAdapters/InteractiveAdapter.sol:InteractiveAdapter': {
          source: 'contracts/interactiveAdapters/InteractiveAdapter.sol',
          name: 'InteractiveAdapter',
          title: 'Base contract for interactive protocol adapters.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          details:
            'deposit() and withdraw() functions MUST be implemented     as well as all the functions from ProtocolAdapter abstract contract.',
          methods: {
            'deposit((address,uint256,uint8)[],bytes)': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                  ],
                  internalType: 'struct TokenAmount[]',
                  name: 'tokenAmounts',
                  type: 'tuple[]',
                },
                { internalType: 'bytes', name: 'data', type: 'bytes' },
              ],
              name: 'deposit',
              outputs: [
                { internalType: 'address[]', name: 'tokensToBeWithdrawn', type: 'address[]' },
              ],
              stateMutability: 'payable',
              type: 'function',
              details:
                'The function must deposit assets to the protocol. MUST return array of tokens to be returned to the account.',
              params: {
                data: 'ABI-encoded additional parameters.',
                tokenAmounts:
                  'Array of TokenAmount structs for the tokens used in deposit action.',
              },
              returns: { tokensToBeWithdrawn: 'Array of tokens to be returned to the account.' },
            },
            'getBalance(address,address)': {
              inputs: [
                { internalType: 'address', name: 'token', type: 'address' },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getBalance',
              outputs: [{ internalType: 'int256', name: 'balance', type: 'int256' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                'MUST return amount of the given token locked on the protocol by the given account.',
              params: { token: 'Address of the account to check balance of.' },
              returns: { balance: 'Balance of the given token for the given account.' },
            },
            'withdraw((address,uint256,uint8)[],bytes)': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                  ],
                  internalType: 'struct TokenAmount[]',
                  name: 'tokenAmounts',
                  type: 'tuple[]',
                },
                { internalType: 'bytes', name: 'data', type: 'bytes' },
              ],
              name: 'withdraw',
              outputs: [
                { internalType: 'address[]', name: 'tokensToBeWithdrawn', type: 'address[]' },
              ],
              stateMutability: 'payable',
              type: 'function',
              details:
                'The function must withdraw assets from the protocol. MUST return array of tokens to be returned to the account.',
              params: {
                data: 'ABI-encoded additional parameters.',
                tokenAmounts:
                  'Array of TokenAmount structs for the tokens used in withdraw action.',
              },
              returns: { tokensToBeWithdrawn: 'Array of tokens to be returned to the account.' },
            },
          },
        },
        'contracts/interfaces/IAdapterManager.sol:IAdapterManager': {
          source: 'contracts/interfaces/IAdapterManager.sol',
          name: 'IAdapterManager',
          title: 'Contract responsible for adapters management.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          details: 'Interface for ProtocolAdapterRegistry and TokenAdaptersRegistry.',
          events: {
            'AdapterSet(bytes32,address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'bytes32', name: 'adapterName', type: 'bytes32' },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldAdapterAddress',
                  type: 'address',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newAdapterAddress',
                  type: 'address',
                },
              ],
              name: 'AdapterSet',
              type: 'event',
              params: {
                adapterName: "Adapter's name.",
                newAdapterAddress: "New adapter's address.",
                oldAdapterAddress: "Old adapter's address.",
              },
              notice: 'Emits old and new adapter addersses.',
            },
          },
          methods: {
            'getAdapterAddress(bytes32)': {
              inputs: [{ internalType: 'bytes32', name: 'name', type: 'bytes32' }],
              name: 'getAdapterAddress',
              outputs: [{ internalType: 'address', name: '', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              params: { name: 'Name of the adapter.' },
              returns: { _0: 'Address of adapter.' },
            },
            'setAdapters((bytes32,address)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address', name: 'adapter', type: 'address' },
                  ],
                  internalType: 'struct AdapterNameAndAddress[]',
                  name: 'adaptersNamesAndAddresses',
                  type: 'tuple[]',
                },
              ],
              name: 'setAdapters',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                adaptersNamesAndAddresses: "Array of the new adapters' names and addresses.",
              },
              notice: 'Sets adapters (adds, updates or removes).',
            },
          },
        },
        'contracts/interfaces/ICaller.sol:ICaller': {
          source: 'contracts/interfaces/ICaller.sol',
          name: 'ICaller',
          methods: {
            'callBytes(bytes)': {
              inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
              name: 'callBytes',
              outputs: [],
              stateMutability: 'payable',
              type: 'function',
            },
            'getExactInputAmount(bytes)': {
              inputs: [{ internalType: 'bytes', name: 'callerCallData', type: 'bytes' }],
              name: 'getExactInputAmount',
              outputs: [{ internalType: 'uint256', name: 'exactInputAmount', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
            },
          },
        },
        'contracts/interfaces/IChiToken.sol:IChiToken': {
          source: 'contracts/interfaces/IChiToken.sol',
          name: 'IChiToken',
          details:
            'ChiToken contract interface. The ChiToken contract is available here github.com/1inch-exchange/chi/blob/master/contracts/ChiToken.sol.',
          methods: {
            'freeFromUpTo(address,uint256)': {
              inputs: [
                { internalType: 'address', name: '', type: 'address' },
                { internalType: 'uint256', name: '', type: 'uint256' },
              ],
              name: 'freeFromUpTo',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          },
        },
        'contracts/interfaces/IDAIPermit.sol:IDAIPermit': {
          source: 'contracts/interfaces/IDAIPermit.sol',
          name: 'IDAIPermit',
          events: {
            'Approval(address,address,uint256)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'owner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'spender', type: 'address' },
                { indexed: !1, internalType: 'uint256', name: 'value', type: 'uint256' },
              ],
              name: 'Approval',
              type: 'event',
            },
            'Transfer(address,address,uint256)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'from', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'to', type: 'address' },
                { indexed: !1, internalType: 'uint256', name: 'value', type: 'uint256' },
              ],
              name: 'Transfer',
              type: 'event',
            },
          },
          methods: {
            'allowance(address,address)': {
              inputs: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'address', name: 'spender', type: 'address' },
              ],
              name: 'allowance',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details:
                'Returns the remaining number of tokens that `spender` will be allowed to spend on behalf of `owner` through {transferFrom}. This is zero by default. This value changes when {approve} or {transferFrom} are called.',
            },
            'approve(address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'approve',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Sets `amount` as the allowance of `spender` over the caller's tokens. Returns a boolean value indicating whether the operation succeeded. IMPORTANT: Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729 Emits an {Approval} event.",
            },
            'balanceOf(address)': {
              inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Returns the amount of tokens owned by `account`.',
            },
            'nonces(address)': {
              inputs: [{ internalType: 'address', name: 'holder', type: 'address' }],
              name: 'nonces',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
            },
            'permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)': {
              inputs: [
                { internalType: 'address', name: 'holder', type: 'address' },
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'nonce', type: 'uint256' },
                { internalType: 'uint256', name: 'expiry', type: 'uint256' },
                { internalType: 'bool', name: 'allowed', type: 'bool' },
                { internalType: 'uint8', name: 'v', type: 'uint8' },
                { internalType: 'bytes32', name: 'r', type: 'bytes32' },
                { internalType: 'bytes32', name: 's', type: 'bytes32' },
              ],
              name: 'permit',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
            'totalSupply()': {
              inputs: [],
              name: 'totalSupply',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Returns the amount of tokens in existence.',
            },
            'transfer(address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'transfer',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Moves `amount` tokens from the caller's account to `recipient`. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.",
            },
            'transferFrom(address,address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'sender', type: 'address' },
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'transferFrom',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Moves `amount` tokens from `sender` to `recipient` using the allowance mechanism. `amount` is then deducted from the caller's allowance. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.",
            },
          },
        },
        'contracts/interfaces/IEIP2612.sol:IEIP2612': {
          source: 'contracts/interfaces/IEIP2612.sol',
          name: 'IEIP2612',
          events: {
            'Approval(address,address,uint256)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'owner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'spender', type: 'address' },
                { indexed: !1, internalType: 'uint256', name: 'value', type: 'uint256' },
              ],
              name: 'Approval',
              type: 'event',
            },
            'Transfer(address,address,uint256)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'from', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'to', type: 'address' },
                { indexed: !1, internalType: 'uint256', name: 'value', type: 'uint256' },
              ],
              name: 'Transfer',
              type: 'event',
            },
          },
          methods: {
            'allowance(address,address)': {
              inputs: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'address', name: 'spender', type: 'address' },
              ],
              name: 'allowance',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details:
                'Returns the remaining number of tokens that `spender` will be allowed to spend on behalf of `owner` through {transferFrom}. This is zero by default. This value changes when {approve} or {transferFrom} are called.',
            },
            'approve(address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'approve',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Sets `amount` as the allowance of `spender` over the caller's tokens. Returns a boolean value indicating whether the operation succeeded. IMPORTANT: Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729 Emits an {Approval} event.",
            },
            'balanceOf(address)': {
              inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Returns the amount of tokens owned by `account`.',
            },
            'nonces(address)': {
              inputs: [{ internalType: 'address', name: 'holder', type: 'address' }],
              name: 'nonces',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
            },
            'permit(address,address,uint256,uint256,uint8,bytes32,bytes32)': {
              inputs: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'value', type: 'uint256' },
                { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                { internalType: 'uint8', name: 'v', type: 'uint8' },
                { internalType: 'bytes32', name: 'r', type: 'bytes32' },
                { internalType: 'bytes32', name: 's', type: 'bytes32' },
              ],
              name: 'permit',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
            'totalSupply()': {
              inputs: [],
              name: 'totalSupply',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Returns the amount of tokens in existence.',
            },
            'transfer(address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'transfer',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Moves `amount` tokens from the caller's account to `recipient`. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.",
            },
            'transferFrom(address,address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'sender', type: 'address' },
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'transferFrom',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Moves `amount` tokens from `sender` to `recipient` using the allowance mechanism. `amount` is then deducted from the caller's allowance. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.",
            },
          },
        },
        'contracts/interfaces/IInteractiveAdapter.sol:IInteractiveAdapter': {
          source: 'contracts/interfaces/IInteractiveAdapter.sol',
          name: 'IInteractiveAdapter',
          title: 'Interface for interactive protocol adapters.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          methods: {
            'deposit((address,uint256,uint8)[],bytes)': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                  ],
                  internalType: 'struct TokenAmount[]',
                  name: 'tokenAmounts',
                  type: 'tuple[]',
                },
                { internalType: 'bytes', name: 'data', type: 'bytes' },
              ],
              name: 'deposit',
              outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
              stateMutability: 'payable',
              type: 'function',
              details: 'Deposits assets to the protocol.',
              params: {
                data: 'ABI-encoded additional parameters.',
                tokenAmounts:
                  'Array of TokenAmount structs for the tokens used in deposit action.',
              },
              returns: {
                _0: 'tokensToBeWithdrawn Array of tokens to be returned to the account.',
              },
            },
            'withdraw((address,uint256,uint8)[],bytes)': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                  ],
                  internalType: 'struct TokenAmount[]',
                  name: 'tokenAmounts',
                  type: 'tuple[]',
                },
                { internalType: 'bytes', name: 'data', type: 'bytes' },
              ],
              name: 'withdraw',
              outputs: [
                { internalType: 'address[]', name: 'tokensToBeWithdrawn', type: 'address[]' },
              ],
              stateMutability: 'payable',
              type: 'function',
              details: 'Withdraws assets from the protocol.',
              params: {
                data: 'ABI-encoded additional parameters.',
                tokenAmounts:
                  'Array of TokenAmount structs for the tokens used in withdraw action.',
              },
              returns: { tokensToBeWithdrawn: 'Array of tokens to be returned to the account.' },
            },
          },
        },
        'contracts/interfaces/IProtocolAdapter.sol:IProtocolAdapter': {
          source: 'contracts/interfaces/IProtocolAdapter.sol',
          name: 'IProtocolAdapter',
          title: 'Protocol adapter interface.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          methods: {
            'getBalance(address,address)': {
              inputs: [
                { internalType: 'address', name: 'token', type: 'address' },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getBalance',
              outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
              stateMutability: 'nonpayable',
              type: 'function',
              returns: {
                _0: 'amount of the given token locked on the protocol by the given account.',
              },
            },
          },
        },
        'contracts/interfaces/IProtocolAdapterRegistry.sol:IProtocolAdapterRegistry': {
          source: 'contracts/interfaces/IProtocolAdapterRegistry.sol',
          name: 'IProtocolAdapterRegistry',
          title: 'Registry for protocol adapters.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          methods: {
            'getAdapterBalance((bytes32,address[]),address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens',
                  name: 'adapterTokens',
                  type: 'tuple',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getAdapterBalance',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance',
                  name: '',
                  type: 'tuple',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adapterTokens: "Protocol adapter's name and tokens.",
              },
              returns: { _0: 'AdapterBalance by the given parameters.' },
            },
            'getAdapterBalances((bytes32,address[])[],address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens[]',
                  name: 'adaptersTokens',
                  type: 'tuple[]',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getAdapterBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance[]',
                  name: '',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adaptersTokens: "Array of the protocol adapters' names and tokens.",
              },
              returns: { _0: 'AdapterBalance array by the given parameters.' },
            },
            'getNonZeroAdapterBalance((bytes32,address[]),address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens',
                  name: 'adapterTokens',
                  type: 'tuple',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getNonZeroAdapterBalance',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance',
                  name: '',
                  type: 'tuple',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adapterTokens: "Protocol adapter's name and tokens.",
              },
              returns: {
                _0: 'AdapterBalance by the given parameters with non-zero token balances.',
              },
            },
            'getNonZeroAdapterBalances((bytes32,address[])[],address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens[]',
                  name: 'adaptersTokens',
                  type: 'tuple[]',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getNonZeroAdapterBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance[]',
                  name: '',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adaptersTokens: "Array of the protocol adapters' names and tokens.",
              },
              returns: {
                _0: 'AdapterBalance array by the given parameters with non-zero token balances.',
              },
            },
          },
        },
        'contracts/interfaces/IProtocolFee.sol:IProtocolFee': {
          source: 'contracts/interfaces/IProtocolFee.sol',
          name: 'IProtocolFee',
          methods: {
            'getProtocolFeeDefault()': {
              inputs: [],
              name: 'getProtocolFeeDefault',
              outputs: [
                {
                  components: [
                    { internalType: 'uint256', name: 'share', type: 'uint256' },
                    { internalType: 'address', name: 'beneficiary', type: 'address' },
                  ],
                  internalType: 'struct Fee',
                  name: 'protocolFeeDefault',
                  type: 'tuple',
                },
              ],
              stateMutability: 'view',
              type: 'function',
              returns: {
                protocolFeeDefault: 'Protocol fee consisting of its share and beneficiary',
              },
              notice: 'Returns current protocol fee default value',
            },
            'getProtocolFeeSigner()': {
              inputs: [],
              name: 'getProtocolFeeSigner',
              outputs: [{ internalType: 'address', name: 'signer', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { signer: 'Current signer address' },
              notice: 'Returns current protocol fee signature signer',
            },
            'setProtocolFeeDefault((uint256,address))': {
              inputs: [
                {
                  components: [
                    { internalType: 'uint256', name: 'share', type: 'uint256' },
                    { internalType: 'address', name: 'beneficiary', type: 'address' },
                  ],
                  internalType: 'struct Fee',
                  name: 'protocolFeeDefault',
                  type: 'tuple',
                },
              ],
              name: 'setProtocolFeeDefault',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: { protocolFeeDefault: 'New base fee defaul value' },
              notice: 'Sets protocol fee default value',
            },
            'setProtocolFeeSigner(address)': {
              inputs: [{ internalType: 'address', name: 'signer', type: 'address' }],
              name: 'setProtocolFeeSigner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: { signer: 'New signer' },
              notice: 'Sets protocol fee signature signer',
            },
          },
        },
        'contracts/interfaces/IRouter.sol:IRouter': {
          source: 'contracts/interfaces/IRouter.sol',
          name: 'IRouter',
          events: {
            'Executed(address,uint256,uint256,address,uint256,uint256,uint256,uint256,(uint8,(uint256,address),(uint256,address),address,address,bytes),address)':
              {
                anonymous: !1,
                inputs: [
                  { indexed: !0, internalType: 'address', name: 'inputToken', type: 'address' },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'absoluteInputAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'inputBalanceChange',
                    type: 'uint256',
                  },
                  { indexed: !0, internalType: 'address', name: 'outputToken', type: 'address' },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'absoluteOutputAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'returnedAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'protocolFeeAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'marketplaceFeeAmount',
                    type: 'uint256',
                  },
                  {
                    components: [
                      { internalType: 'enum SwapType', name: 'swapType', type: 'uint8' },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'protocolFee',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'marketplaceFee',
                        type: 'tuple',
                      },
                      { internalType: 'address', name: 'account', type: 'address' },
                      { internalType: 'address', name: 'caller', type: 'address' },
                      { internalType: 'bytes', name: 'callerCallData', type: 'bytes' },
                    ],
                    indexed: !1,
                    internalType: 'struct SwapDescription',
                    name: 'swapDescription',
                    type: 'tuple',
                  },
                  { indexed: !1, internalType: 'address', name: 'sender', type: 'address' },
                ],
                name: 'Executed',
                type: 'event',
                params: {
                  absoluteInputAmount:
                    'Max amount of input token to be taken from the account address',
                  absoluteOutputAmount:
                    'Min amount of output token to be returned to the account address',
                  inputBalanceChange:
                    'Actual amount of input token taken from the account address',
                  inputToken: 'Input token address',
                  marketplaceFeeAmount: 'Marketplace fee amount',
                  outputToken: 'Output token address',
                  protocolFeeAmount: 'Protocol fee amount',
                  returnedAmount: 'Actual amount of tokens returned to the account address',
                  sender: 'Address that called the Router contract',
                  swapDescription: 'Swap parameters',
                },
                notice: 'Emits swap info',
              },
          },
          methods: {
            'execute(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),(uint256,address),address,address,bytes),(uint256,bytes),(uint256,bytes))':
              {
                inputs: [
                  {
                    components: [
                      {
                        components: [
                          { internalType: 'address', name: 'token', type: 'address' },
                          { internalType: 'uint256', name: 'amount', type: 'uint256' },
                          { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                        ],
                        internalType: 'struct TokenAmount',
                        name: 'tokenAmount',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'enum PermitType', name: 'permitType', type: 'uint8' },
                          { internalType: 'bytes', name: 'permitCallData', type: 'bytes' },
                        ],
                        internalType: 'struct Permit',
                        name: 'permit',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Input',
                    name: 'input',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'address', name: 'token', type: 'address' },
                      { internalType: 'uint256', name: 'absoluteAmount', type: 'uint256' },
                    ],
                    internalType: 'struct AbsoluteTokenAmount',
                    name: 'absoluteOutput',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'enum SwapType', name: 'swapType', type: 'uint8' },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'protocolFee',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'marketplaceFee',
                        type: 'tuple',
                      },
                      { internalType: 'address', name: 'account', type: 'address' },
                      { internalType: 'address', name: 'caller', type: 'address' },
                      { internalType: 'bytes', name: 'callerCallData', type: 'bytes' },
                    ],
                    internalType: 'struct SwapDescription',
                    name: 'swapDescription',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'uint256', name: 'salt', type: 'uint256' },
                      { internalType: 'bytes', name: 'signature', type: 'bytes' },
                    ],
                    internalType: 'struct AccountSignature',
                    name: 'accountSignature',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                      { internalType: 'bytes', name: 'signature', type: 'bytes' },
                    ],
                    internalType: 'struct ProtocolFeeSignature',
                    name: 'protocolFeeSignature',
                    type: 'tuple',
                  },
                ],
                name: 'execute',
                outputs: [
                  { internalType: 'uint256', name: 'inputBalanceChange', type: 'uint256' },
                  { internalType: 'uint256', name: 'outputBalanceChange', type: 'uint256' },
                ],
                stateMutability: 'payable',
                type: 'function',
                params: {
                  absoluteOutput:
                    'Token and absolute amount requirement     to be returned to the account address',
                  accountSignature:
                    'Signature for the relayed transaction     (checks that account address is the one who actually did a signature)',
                  input:
                    'Token and amount (relative or absolute) to be taken from the account address, also, permit type and call data may provided if required',
                  protocolFeeSignature:
                    'Signature for the discounted protocol fee     (checks that current protocol fee signer is the one who actually did a signature)',
                  swapDescription:
                    'Swap description with the following elements:\\n     - Whether the inputs or outputs are fixed     - Protocol fee share and beneficiary address     - Marketplace fee share and beneficiary address     - Address of the account executing the swap     - Address of the Caller contract to be called     - Calldata for the call to the Caller contract',
                },
                returns: {
                  inputBalanceChange: 'Input token balance change',
                  outputBalanceChange: 'Output token balance change (including fees)',
                },
                notice: 'Main function executing the swaps',
              },
            'returnLostTokens(address,address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'token', type: 'address' },
                { internalType: 'address payable', name: 'beneficiary', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'returnLostTokens',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: {
                amount: 'Amount of tokens to return',
                beneficiary: 'Address that will receive tokens',
                token: 'Address of token',
              },
              notice: 'Returns tokens mistakenly sent to this contract',
            },
          },
        },
        'contracts/interfaces/ISignatureVerifier.sol:ISignatureVerifier': {
          source: 'contracts/interfaces/ISignatureVerifier.sol',
          name: 'ISignatureVerifier',
          methods: {
            'hashData(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),(uint256,address),address,address,bytes),uint256)':
              {
                inputs: [
                  {
                    components: [
                      {
                        components: [
                          { internalType: 'address', name: 'token', type: 'address' },
                          { internalType: 'uint256', name: 'amount', type: 'uint256' },
                          { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                        ],
                        internalType: 'struct TokenAmount',
                        name: 'tokenAmount',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'enum PermitType', name: 'permitType', type: 'uint8' },
                          { internalType: 'bytes', name: 'permitCallData', type: 'bytes' },
                        ],
                        internalType: 'struct Permit',
                        name: 'permit',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Input',
                    name: 'input',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'address', name: 'token', type: 'address' },
                      { internalType: 'uint256', name: 'absoluteAmount', type: 'uint256' },
                    ],
                    internalType: 'struct AbsoluteTokenAmount',
                    name: 'requiredOutput',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'enum SwapType', name: 'swapType', type: 'uint8' },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'protocolFee',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'marketplaceFee',
                        type: 'tuple',
                      },
                      { internalType: 'address', name: 'account', type: 'address' },
                      { internalType: 'address', name: 'caller', type: 'address' },
                      { internalType: 'bytes', name: 'callerCallData', type: 'bytes' },
                    ],
                    internalType: 'struct SwapDescription',
                    name: 'swapDescription',
                    type: 'tuple',
                  },
                  { internalType: 'uint256', name: 'salt', type: 'uint256' },
                ],
                name: 'hashData',
                outputs: [{ internalType: 'bytes32', name: 'hashedData', type: 'bytes32' }],
                stateMutability: 'view',
                type: 'function',
                params: {
                  input: 'Input struct to be hashed.',
                  requiredOutput: 'AbsoluteTokenAmount struct to be hashed.',
                  salt: 'Salt parameter preventing double-spending to be hashed.',
                  swapDescription: 'SwapDescription struct to be hashed.',
                },
                returns: { hashedData: 'Execute data hashed with domainSeparator.' },
              },
            'isHashUsed(bytes32,address)': {
              inputs: [
                { internalType: 'bytes32', name: 'hashToCheck', type: 'bytes32' },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'isHashUsed',
              outputs: [{ internalType: 'bool', name: 'hashUsed', type: 'bool' }],
              stateMutability: 'view',
              type: 'function',
              params: {
                account: 'Address of the hash will be checked for.',
                hashToCheck: 'Hash to be checked.',
              },
              returns: { hashUsed: 'True if hash has already been used by this account address.' },
            },
          },
        },
        'contracts/interfaces/ITokenAdapter.sol:ITokenAdapter': {
          source: 'contracts/interfaces/ITokenAdapter.sol',
          name: 'ITokenAdapter',
          title: 'Token adapter interface.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          methods: {
            'getMetadata((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getMetadata',
              outputs: [
                {
                  components: [
                    { internalType: 'string', name: 'name', type: 'string' },
                    { internalType: 'string', name: 'symbol', type: 'string' },
                    { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                  ],
                  internalType: 'struct ERC20Metadata',
                  name: 'metadata',
                  type: 'tuple',
                },
              ],
              stateMutability: 'view',
              type: 'function',
              params: { tokenBalance: 'TokenBalance struct with token info to get metadata for.' },
              returns: { metadata: 'ERC20Metadata struct with IERC20-style token info.' },
            },
            'getUnderlyingTokenBalances((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getUnderlyingTokenBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'underlyingTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct with token info to get underlying token balances for.',
              },
              returns: {
                underlyingTokenBalances:
                  'Array of TokenBalance structs with underlying token balances.',
              },
            },
          },
        },
        'contracts/interfaces/ITokenAdapterNamesManager.sol:ITokenAdapterNamesManager': {
          source: 'contracts/interfaces/ITokenAdapterNamesManager.sol',
          name: 'ITokenAdapterNamesManager',
          title: "TokenAdapterRegistry part responsible for contracts' hashes management.",
          author: 'Igor Sobolev <sobolev@zerion.io>',
          details: 'Interface for TokenAdapterRegistry.',
          events: {
            'TokenAdapterNameSet(bytes32,bytes32,bytes32)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'bytes32', name: 'hash', type: 'bytes32' },
                {
                  indexed: !0,
                  internalType: 'bytes32',
                  name: 'oldTokenAdapterName',
                  type: 'bytes32',
                },
                {
                  indexed: !0,
                  internalType: 'bytes32',
                  name: 'newTokenAdapterName',
                  type: 'bytes32',
                },
              ],
              name: 'TokenAdapterNameSet',
              type: 'event',
              params: {
                hash: 'Hash of token address or token code.',
                newTokenAdapterName: "New token adapter's name.",
                oldTokenAdapterName: "Old token adapter's name.",
              },
              notice: 'Emits old and new token adapter names.',
            },
          },
          methods: {
            'getTokenAdapterName(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenAdapterName',
              outputs: [{ internalType: 'bytes32', name: 'name', type: 'bytes32' }],
              stateMutability: 'view',
              type: 'function',
              params: { token: 'Address of token.' },
              returns: { name: 'Name of token adapter.' },
            },
            'getTokenHash(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenHash',
              outputs: [{ internalType: 'bytes32', name: 'hash', type: 'bytes32' }],
              stateMutability: 'view',
              type: 'function',
              params: { token: 'Address of token.' },
              returns: { hash: "Hash of token's bytecode." },
            },
            'setTokenAdapterNames((bytes32,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'hash', type: 'bytes32' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct HashAndAdapterName[]',
                  name: 'hashesAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNames',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: { hashesAndAdapterNames: "Array of hashes and new token adapters' names." },
              notice: "Sets token adapters' names using hashes.",
            },
            'setTokenAdapterNamesByHashes((address,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct TokenAndAdapterName[]',
                  name: 'tokensAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNamesByHashes',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                tokensAndAdapterNames: "Array of tokens addresses and new token adapters' names.",
              },
              notice: "Sets token adapters' names by tokens' hashes using tokens addresses.",
            },
            'setTokenAdapterNamesByTokens((address,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct TokenAndAdapterName[]',
                  name: 'tokensAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNamesByTokens',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                tokensAndAdapterNames: "Array of tokens addresses and new token adapters' names.",
              },
              notice: "Sets token adapters' names by tokens addresses.",
            },
          },
        },
        'contracts/interfaces/ITokenAdapterRegistry.sol:ITokenAdapterRegistry': {
          source: 'contracts/interfaces/ITokenAdapterRegistry.sol',
          name: 'ITokenAdapterRegistry',
          title: 'Registry for token adapters.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          methods: {
            'getFinalFullTokenBalances(address[])': {
              inputs: [{ internalType: 'address[]', name: 'tokens', type: 'address[]' }],
              name: 'getFinalFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'finalFullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Amount is considered to be 10 ** decimals.',
              params: { tokens: 'Array of token addresses.' },
              returns: {
                finalFullTokenBalances:
                  "Array of FullTokenBalance structs     with 'deepest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with final underlying tokens.',
            },
            'getFinalFullTokenBalances((address,int256)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'tokenBalances',
                  type: 'tuple[]',
                },
              ],
              name: 'getFinalFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'finalFullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalances:
                  'Array of TokenBalance structs consisting of     token addresses and absolute amounts.',
              },
              returns: {
                finalFullTokenBalances:
                  "Array of FullTokenBalance structs     with 'deepest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with final underlying tokens.',
            },
            'getFinalUnderlyingTokenBalances((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getFinalUnderlyingTokenBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'finalUnderlyingTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct consisting of token address and absolute amount.',
              },
              returns: {
                finalUnderlyingTokenBalances:
                  "Array of TokenBalance structs     with 'deepest' underlying token balances.",
              },
            },
            'getFullTokenBalance((address,int256),(address,int256)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'underlyingTokenBalances',
                  type: 'tuple[]',
                },
              ],
              name: 'getFullTokenBalance',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance',
                  name: 'fullTokenBalance',
                  type: 'tuple',
                },
              ],
              stateMutability: 'view',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct consisting of token address and absolute amount.',
                underlyingTokenBalances:
                  'TokenBalance structs array consisting of     token address and absolute amount for each underlying token.',
              },
              returns: {
                fullTokenBalance:
                  'FullTokenBalance struct given token and underlying tokens balances.',
              },
            },
            'getFullTokenBalances((address,int256)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'tokenBalances',
                  type: 'tuple[]',
                },
              ],
              name: 'getFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'fullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalances:
                  'Array of TokenBalance structs consisting of     token addresses and absolute amounts.',
              },
              returns: {
                fullTokenBalances:
                  "Array of FullTokenBalance structs     with 'closest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with underlying tokens.',
            },
            'getFullTokenBalances(address[])': {
              inputs: [{ internalType: 'address[]', name: 'tokens', type: 'address[]' }],
              name: 'getFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'fullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Amount is considered to be 10 ** decimals.',
              params: { tokens: 'Array of token addresses.' },
              returns: {
                fullTokenBalances:
                  "Array of FullTokenBalance structs     with 'closest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with underlying tokens.',
            },
            'getTokenAdapter(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenAdapter',
              outputs: [{ internalType: 'address', name: 'tokenAdapter', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Gets token adapter address for the given token address.',
              params: { token: 'Address of the token.' },
              returns: { tokenAdapter: 'Token adapter address.' },
            },
            'getUnderlyingTokenBalances((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getUnderlyingTokenBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: '',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct consisting of token address and absolute amount.',
              },
              returns: {
                _0: "Array of TokenBalance structs with 'closest' underlying token balances.",
              },
            },
          },
        },
        'contracts/interfaces/IUniswapV2Pair.sol:IUniswapV2Pair': {
          source: 'contracts/interfaces/IUniswapV2Pair.sol',
          name: 'IUniswapV2Pair',
          details:
            'UniswapV2Pair contract interface. The UniswapV2Pair contract is available here github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2Pair.sol.',
          methods: {
            'burn(address)': {
              inputs: [{ internalType: 'address', name: '', type: 'address' }],
              name: 'burn',
              outputs: [
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
            },
            'getReserves()': {
              inputs: [],
              name: 'getReserves',
              outputs: [
                { internalType: 'uint112', name: '', type: 'uint112' },
                { internalType: 'uint112', name: '', type: 'uint112' },
                { internalType: 'uint32', name: '', type: 'uint32' },
              ],
              stateMutability: 'view',
              type: 'function',
            },
            'mint(address)': {
              inputs: [{ internalType: 'address', name: '', type: 'address' }],
              name: 'mint',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'nonpayable',
              type: 'function',
            },
            'swap(uint256,uint256,address,bytes)': {
              inputs: [
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'address', name: '', type: 'address' },
                { internalType: 'bytes', name: '', type: 'bytes' },
              ],
              name: 'swap',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
            'token0()': {
              inputs: [],
              name: 'token0',
              outputs: [{ internalType: 'address', name: '', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
            },
            'token1()': {
              inputs: [],
              name: 'token1',
              outputs: [{ internalType: 'address', name: '', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
            },
          },
        },
        'contracts/interfaces/IUniswapV2Router02.sol:IUniswapV2Router02': {
          source: 'contracts/interfaces/IUniswapV2Router02.sol',
          name: 'IUniswapV2Router02',
          details:
            'UniswapV2Router02 contract interface. The UniswapV2Router02 contract is available here github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/UniswapV2Router02.sol.',
          methods: {
            'swapExactETHForTokens(uint256,address[],address,uint256)': {
              inputs: [
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'address[]', name: '', type: 'address[]' },
                { internalType: 'address', name: '', type: 'address' },
                { internalType: 'uint256', name: '', type: 'uint256' },
              ],
              name: 'swapExactETHForTokens',
              outputs: [],
              stateMutability: 'payable',
              type: 'function',
            },
          },
        },
        'contracts/interfaces/IWETH9.sol:IWETH9': {
          source: 'contracts/interfaces/IWETH9.sol',
          name: 'IWETH9',
          details:
            'WETH9 contract interface. Only the functions required for WethInteractiveAdapter contract are added. The WETH9 contract is available here github.com/0xProject/0x-monorepo/blob/development/contracts/erc20/contracts/src/WETH9.sol.',
          methods: {
            'balanceOf(address)': {
              inputs: [{ internalType: 'address', name: '', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
            },
            'deposit()': {
              inputs: [],
              name: 'deposit',
              outputs: [],
              stateMutability: 'payable',
              type: 'function',
            },
            'withdraw(uint256)': {
              inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              name: 'withdraw',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          },
        },
        'contracts/interfaces/IYearnPermit.sol:IYearnPermit': {
          source: 'contracts/interfaces/IYearnPermit.sol',
          name: 'IYearnPermit',
          events: {
            'Approval(address,address,uint256)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'owner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'spender', type: 'address' },
                { indexed: !1, internalType: 'uint256', name: 'value', type: 'uint256' },
              ],
              name: 'Approval',
              type: 'event',
            },
            'Transfer(address,address,uint256)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'from', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'to', type: 'address' },
                { indexed: !1, internalType: 'uint256', name: 'value', type: 'uint256' },
              ],
              name: 'Transfer',
              type: 'event',
            },
          },
          methods: {
            'allowance(address,address)': {
              inputs: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'address', name: 'spender', type: 'address' },
              ],
              name: 'allowance',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details:
                'Returns the remaining number of tokens that `spender` will be allowed to spend on behalf of `owner` through {transferFrom}. This is zero by default. This value changes when {approve} or {transferFrom} are called.',
            },
            'approve(address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'approve',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Sets `amount` as the allowance of `spender` over the caller's tokens. Returns a boolean value indicating whether the operation succeeded. IMPORTANT: Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729 Emits an {Approval} event.",
            },
            'balanceOf(address)': {
              inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Returns the amount of tokens owned by `account`.',
            },
            'permit(address,address,uint256,uint256,bytes)': {
              inputs: [
                { internalType: 'address', name: '', type: 'address' },
                { internalType: 'address', name: '', type: 'address' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'bytes', name: '', type: 'bytes' },
              ],
              name: 'permit',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
            'totalSupply()': {
              inputs: [],
              name: 'totalSupply',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Returns the amount of tokens in existence.',
            },
            'transfer(address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'transfer',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Moves `amount` tokens from the caller's account to `recipient`. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.",
            },
            'transferFrom(address,address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'sender', type: 'address' },
                { internalType: 'address', name: 'recipient', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'transferFrom',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                "Moves `amount` tokens from `sender` to `recipient` using the allowance mechanism. `amount` is then deducted from the caller's allowance. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.",
            },
          },
        },
        'contracts/mock/MockInteractiveAdapter.sol:MockInteractiveAdapter': {
          source: 'contracts/mock/MockInteractiveAdapter.sol',
          name: 'MockInteractiveAdapter',
          title: 'Mock interactive adapter.',
          details: 'Implementation of InteractiveAdapter abstract contract.',
          methods: {
            'deposit((address,uint256,uint8)[],bytes)': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                  ],
                  internalType: 'struct TokenAmount[]',
                  name: '',
                  type: 'tuple[]',
                },
                { internalType: 'bytes', name: '', type: 'bytes' },
              ],
              name: 'deposit',
              outputs: [
                { internalType: 'address[]', name: 'tokensToBeWithdrawn', type: 'address[]' },
              ],
              stateMutability: 'payable',
              type: 'function',
              details: 'Implementation of InteractiveAdapter function.',
              notice: 'Mock deposit function.',
            },
            'getBalance(address,address)': {
              inputs: [
                { internalType: 'address', name: '', type: 'address' },
                { internalType: 'address', name: '', type: 'address' },
              ],
              name: 'getBalance',
              outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
              stateMutability: 'pure',
              type: 'function',
              details: 'Implementation of ProtocolAdapter function.',
              notice: 'Mock getBalance function.',
            },
            'withdraw((address,uint256,uint8)[],bytes)': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                  ],
                  internalType: 'struct TokenAmount[]',
                  name: '',
                  type: 'tuple[]',
                },
                { internalType: 'bytes', name: '', type: 'bytes' },
              ],
              name: 'withdraw',
              outputs: [
                { internalType: 'address[]', name: 'tokensToBeWithdrawn', type: 'address[]' },
              ],
              stateMutability: 'payable',
              type: 'function',
              details: 'Implementation of InteractiveAdapter function.',
              notice: 'Mock withdraw function.',
            },
          },
        },
        'contracts/protocolAdapters/ProtocolAdapter.sol:ProtocolAdapter': {
          source: 'contracts/protocolAdapters/ProtocolAdapter.sol',
          name: 'ProtocolAdapter',
          title: 'Protocol adapter abstract contract.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          details: 'getBalance() function MUST be implemented.',
          methods: {
            'getBalance(address,address)': {
              inputs: [
                { internalType: 'address', name: 'token', type: 'address' },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getBalance',
              outputs: [{ internalType: 'int256', name: 'balance', type: 'int256' }],
              stateMutability: 'nonpayable',
              type: 'function',
              details:
                'MUST return amount of the given token locked on the protocol by the given account.',
              params: { token: 'Address of the account to check balance of.' },
              returns: { balance: 'Balance of the given token for the given account.' },
            },
          },
        },
        'contracts/registries/AdapterManager.sol:AdapterManager': {
          source: 'contracts/registries/AdapterManager.sol',
          name: 'AdapterManager',
          title: 'Contract responsible for adapters management.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          details: 'Base contract for ProtocolAdapterRegistry and TokenAdaptersRegistry.',
          events: {
            'AdapterSet(bytes32,address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'bytes32', name: 'adapterName', type: 'bytes32' },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldAdapterAddress',
                  type: 'address',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newAdapterAddress',
                  type: 'address',
                },
              ],
              name: 'AdapterSet',
              type: 'event',
              notice: 'Emits old and new adapter addersses.',
            },
            'OwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newOwner', type: 'address' },
              ],
              name: 'OwnerSet',
              type: 'event',
              notice: 'Emits old and new owners',
            },
            'PendingOwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldPendingOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newPendingOwner', type: 'address' },
              ],
              name: 'PendingOwnerSet',
              type: 'event',
              notice: 'Emits old and new pending owners',
            },
          },
          methods: {
            'getAdapterAddress(bytes32)': {
              inputs: [{ internalType: 'bytes32', name: 'name', type: 'bytes32' }],
              name: 'getAdapterAddress',
              outputs: [{ internalType: 'address', name: 'adapter', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              params: { name: 'Name of the adapter.' },
              returns: { adapter: 'Address of adapter.' },
            },
            'getOwner()': {
              inputs: [],
              name: 'getOwner',
              outputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { owner: 'Owner of the contract' },
            },
            'getPendingOwner()': {
              inputs: [],
              name: 'getPendingOwner',
              outputs: [{ internalType: 'address', name: 'pendingOwner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { pendingOwner: 'Pending owner of the contract' },
            },
            'setAdapters((bytes32,address)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address', name: 'adapter', type: 'address' },
                  ],
                  internalType: 'struct AdapterNameAndAddress[]',
                  name: 'adaptersNamesAndAddresses',
                  type: 'tuple[]',
                },
              ],
              name: 'setAdapters',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                adaptersNamesAndAddresses: "Array of the new adapters' names and addresses.",
              },
              notice: 'Sets adapters (adds, updates or removes).',
            },
            'setOwner()': {
              inputs: [],
              name: 'setOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the pending owner',
              notice: 'Sets owner to the pending owner',
            },
            'setPendingOwner(address)': {
              inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
              name: 'setPendingOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the owner',
              params: { newPendingOwner: 'Address of new pending owner' },
              notice: 'Sets pending owner to the `newPendingOwner` address',
            },
          },
        },
        'contracts/registries/ProtocolAdapterRegistry.sol:ProtocolAdapterRegistry': {
          source: 'contracts/registries/ProtocolAdapterRegistry.sol',
          name: 'ProtocolAdapterRegistry',
          title: 'Registry for protocol adapters.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          events: {
            'AdapterSet(bytes32,address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'bytes32', name: 'adapterName', type: 'bytes32' },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldAdapterAddress',
                  type: 'address',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newAdapterAddress',
                  type: 'address',
                },
              ],
              name: 'AdapterSet',
              type: 'event',
              notice: 'Emits old and new adapter addersses.',
            },
            'OwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newOwner', type: 'address' },
              ],
              name: 'OwnerSet',
              type: 'event',
              notice: 'Emits old and new owners',
            },
            'PendingOwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldPendingOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newPendingOwner', type: 'address' },
              ],
              name: 'PendingOwnerSet',
              type: 'event',
              notice: 'Emits old and new pending owners',
            },
          },
          methods: {
            'getAdapterAddress(bytes32)': {
              inputs: [{ internalType: 'bytes32', name: 'name', type: 'bytes32' }],
              name: 'getAdapterAddress',
              outputs: [{ internalType: 'address', name: 'adapter', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              params: { name: 'Name of the adapter.' },
              returns: { adapter: 'Address of adapter.' },
            },
            'getAdapterBalance((bytes32,address[]),address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens',
                  name: 'adapterTokens',
                  type: 'tuple',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getAdapterBalance',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance',
                  name: 'adapterBalance',
                  type: 'tuple',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adapterTokens: "Protocol adapter's name and tokens.",
              },
              returns: { adapterBalance: 'AdapterBalance by the given parameters.' },
            },
            'getAdapterBalances((bytes32,address[])[],address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens[]',
                  name: 'adaptersTokens',
                  type: 'tuple[]',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getAdapterBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance[]',
                  name: 'adapterBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adaptersTokens: "Array of the protocol adapters' names and tokens.",
              },
              returns: { adapterBalances: 'AdapterBalance array by the given parameters.' },
            },
            'getNonZeroAdapterBalance((bytes32,address[]),address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens',
                  name: 'adapterTokens',
                  type: 'tuple',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getNonZeroAdapterBalance',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance',
                  name: 'nonZeroAdapterBalance',
                  type: 'tuple',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adapterTokens: "Protocol adapter's name and tokens.",
              },
              returns: {
                nonZeroAdapterBalance:
                  'AdapterBalance by the given parameters with non-zero token balances.',
              },
            },
            'getNonZeroAdapterBalances((bytes32,address[])[],address)': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address[]', name: 'tokens', type: 'address[]' },
                  ],
                  internalType: 'struct AdapterTokens[]',
                  name: 'adaptersTokens',
                  type: 'tuple[]',
                },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'getNonZeroAdapterBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    {
                      components: [
                        { internalType: 'address', name: 'token', type: 'address' },
                        { internalType: 'int256', name: 'amount', type: 'int256' },
                      ],
                      internalType: 'struct TokenBalance[]',
                      name: 'tokenBalances',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct AdapterBalance[]',
                  name: 'adapterBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                account: 'Address of the account.',
                adaptersTokens: "Array of the protocol adapters' names and tokens.",
              },
              returns: {
                adapterBalances:
                  'AdapterBalance array by the given parameters with non-zero token balances.',
              },
            },
            'getOwner()': {
              inputs: [],
              name: 'getOwner',
              outputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { owner: 'Owner of the contract' },
            },
            'getPendingOwner()': {
              inputs: [],
              name: 'getPendingOwner',
              outputs: [{ internalType: 'address', name: 'pendingOwner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { pendingOwner: 'Pending owner of the contract' },
            },
            'setAdapters((bytes32,address)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address', name: 'adapter', type: 'address' },
                  ],
                  internalType: 'struct AdapterNameAndAddress[]',
                  name: 'adaptersNamesAndAddresses',
                  type: 'tuple[]',
                },
              ],
              name: 'setAdapters',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                adaptersNamesAndAddresses: "Array of the new adapters' names and addresses.",
              },
              notice: 'Sets adapters (adds, updates or removes).',
            },
            'setOwner()': {
              inputs: [],
              name: 'setOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the pending owner',
              notice: 'Sets owner to the pending owner',
            },
            'setPendingOwner(address)': {
              inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
              name: 'setPendingOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the owner',
              params: { newPendingOwner: 'Address of new pending owner' },
              notice: 'Sets pending owner to the `newPendingOwner` address',
            },
          },
        },
        'contracts/registries/TokenAdapterNamesManager.sol:TokenAdapterNamesManager': {
          source: 'contracts/registries/TokenAdapterNamesManager.sol',
          name: 'TokenAdapterNamesManager',
          title: "TokenAdapterRegistry part responsible for contracts' hashes management.",
          author: 'Igor Sobolev <sobolev@zerion.io>',
          details: 'Base contract for TokenAdapterRegistry.',
          events: {
            'OwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newOwner', type: 'address' },
              ],
              name: 'OwnerSet',
              type: 'event',
              notice: 'Emits old and new owners',
            },
            'PendingOwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldPendingOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newPendingOwner', type: 'address' },
              ],
              name: 'PendingOwnerSet',
              type: 'event',
              notice: 'Emits old and new pending owners',
            },
            'TokenAdapterNameSet(bytes32,bytes32,bytes32)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'bytes32', name: 'hash', type: 'bytes32' },
                {
                  indexed: !0,
                  internalType: 'bytes32',
                  name: 'oldTokenAdapterName',
                  type: 'bytes32',
                },
                {
                  indexed: !0,
                  internalType: 'bytes32',
                  name: 'newTokenAdapterName',
                  type: 'bytes32',
                },
              ],
              name: 'TokenAdapterNameSet',
              type: 'event',
              notice: 'Emits old and new token adapter names.',
            },
          },
          methods: {
            'getOwner()': {
              inputs: [],
              name: 'getOwner',
              outputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { owner: 'Owner of the contract' },
            },
            'getPendingOwner()': {
              inputs: [],
              name: 'getPendingOwner',
              outputs: [{ internalType: 'address', name: 'pendingOwner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { pendingOwner: 'Pending owner of the contract' },
            },
            'getTokenAdapterName(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenAdapterName',
              outputs: [{ internalType: 'bytes32', name: 'name', type: 'bytes32' }],
              stateMutability: 'view',
              type: 'function',
              params: { token: 'Address of token.' },
              returns: { name: 'Name of token adapter.' },
            },
            'getTokenHash(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenHash',
              outputs: [{ internalType: 'bytes32', name: 'hash', type: 'bytes32' }],
              stateMutability: 'view',
              type: 'function',
              params: { token: 'Address of token.' },
              returns: { hash: "Hash of token's bytecode." },
            },
            'setOwner()': {
              inputs: [],
              name: 'setOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the pending owner',
              notice: 'Sets owner to the pending owner',
            },
            'setPendingOwner(address)': {
              inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
              name: 'setPendingOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the owner',
              params: { newPendingOwner: 'Address of new pending owner' },
              notice: 'Sets pending owner to the `newPendingOwner` address',
            },
            'setTokenAdapterNames((bytes32,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'hash', type: 'bytes32' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct HashAndAdapterName[]',
                  name: 'hashesAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNames',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: { hashesAndAdapterNames: "Array of hashes and new token adapters' names." },
              notice: "Sets token adapters' names using hashes.",
            },
            'setTokenAdapterNamesByHashes((address,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct TokenAndAdapterName[]',
                  name: 'tokensAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNamesByHashes',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                tokensAndAdapterNames: "Array of tokens addresses and new token adapters' names.",
              },
              notice: "Sets token adapters' names by tokens' hashes using tokens addresses.",
            },
            'setTokenAdapterNamesByTokens((address,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct TokenAndAdapterName[]',
                  name: 'tokensAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNamesByTokens',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                tokensAndAdapterNames: "Array of tokens addresses and new token adapters' names.",
              },
              notice: "Sets token adapters' names by tokens addresses.",
            },
          },
        },
        'contracts/registries/TokenAdapterRegistry.sol:TokenAdapterRegistry': {
          source: 'contracts/registries/TokenAdapterRegistry.sol',
          name: 'TokenAdapterRegistry',
          title: 'Registry for token adapters.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          events: {
            'AdapterSet(bytes32,address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'bytes32', name: 'adapterName', type: 'bytes32' },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldAdapterAddress',
                  type: 'address',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newAdapterAddress',
                  type: 'address',
                },
              ],
              name: 'AdapterSet',
              type: 'event',
              notice: 'Emits old and new adapter addersses.',
            },
            'OwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newOwner', type: 'address' },
              ],
              name: 'OwnerSet',
              type: 'event',
              notice: 'Emits old and new owners',
            },
            'PendingOwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldPendingOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newPendingOwner', type: 'address' },
              ],
              name: 'PendingOwnerSet',
              type: 'event',
              notice: 'Emits old and new pending owners',
            },
            'TokenAdapterNameSet(bytes32,bytes32,bytes32)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'bytes32', name: 'hash', type: 'bytes32' },
                {
                  indexed: !0,
                  internalType: 'bytes32',
                  name: 'oldTokenAdapterName',
                  type: 'bytes32',
                },
                {
                  indexed: !0,
                  internalType: 'bytes32',
                  name: 'newTokenAdapterName',
                  type: 'bytes32',
                },
              ],
              name: 'TokenAdapterNameSet',
              type: 'event',
              notice: 'Emits old and new token adapter names.',
            },
          },
          methods: {
            'getAdapterAddress(bytes32)': {
              inputs: [{ internalType: 'bytes32', name: 'name', type: 'bytes32' }],
              name: 'getAdapterAddress',
              outputs: [{ internalType: 'address', name: 'adapter', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              params: { name: 'Name of the adapter.' },
              returns: { adapter: 'Address of adapter.' },
            },
            'getFinalFullTokenBalances(address[])': {
              inputs: [{ internalType: 'address[]', name: 'tokens', type: 'address[]' }],
              name: 'getFinalFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'finalFullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Amount is considered to be 10 ** decimals.',
              params: { tokens: 'Array of token addresses.' },
              returns: {
                finalFullTokenBalances:
                  "Array of FullTokenBalance structs     with 'deepest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with final underlying tokens.',
            },
            'getFinalFullTokenBalances((address,int256)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'tokenBalances',
                  type: 'tuple[]',
                },
              ],
              name: 'getFinalFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'finalFullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalances:
                  'Array of TokenBalance structs consisting of     token addresses and absolute amounts.',
              },
              returns: {
                finalFullTokenBalances:
                  "Array of FullTokenBalance structs     with 'deepest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with final underlying tokens.',
            },
            'getFinalUnderlyingTokenBalances((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getFinalUnderlyingTokenBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'finalUnderlyingTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct consisting of token address and absolute amount.',
              },
              returns: {
                finalUnderlyingTokenBalances:
                  "Array of TokenBalance structs     with 'deepest' underlying token balances.",
              },
            },
            'getFullTokenBalance((address,int256),(address,int256)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'underlyingTokenBalances',
                  type: 'tuple[]',
                },
              ],
              name: 'getFullTokenBalance',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance',
                  name: 'fullTokenBalance',
                  type: 'tuple',
                },
              ],
              stateMutability: 'view',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct consisting of token address and absolute amount.',
                underlyingTokenBalances:
                  'TokenBalance structs array consisting of     token address and absolute amount for each underlying token.',
              },
              returns: {
                fullTokenBalance:
                  'FullTokenBalance struct given token and underlying tokens balances.',
              },
            },
            'getFullTokenBalances((address,int256)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'tokenBalances',
                  type: 'tuple[]',
                },
              ],
              name: 'getFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'fullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalances:
                  'Array of TokenBalance structs consisting of     token addresses and absolute amounts.',
              },
              returns: {
                fullTokenBalances:
                  "Array of FullTokenBalance structs     with 'closest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with underlying tokens.',
            },
            'getFullTokenBalances(address[])': {
              inputs: [{ internalType: 'address[]', name: 'tokens', type: 'address[]' }],
              name: 'getFullTokenBalances',
              outputs: [
                {
                  components: [
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta',
                      name: 'base',
                      type: 'tuple',
                    },
                    {
                      components: [
                        {
                          components: [
                            { internalType: 'address', name: 'token', type: 'address' },
                            { internalType: 'int256', name: 'amount', type: 'int256' },
                          ],
                          internalType: 'struct TokenBalance',
                          name: 'tokenBalance',
                          type: 'tuple',
                        },
                        {
                          components: [
                            { internalType: 'string', name: 'name', type: 'string' },
                            { internalType: 'string', name: 'symbol', type: 'string' },
                            { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                          ],
                          internalType: 'struct ERC20Metadata',
                          name: 'erc20metadata',
                          type: 'tuple',
                        },
                      ],
                      internalType: 'struct TokenBalanceMeta[]',
                      name: 'underlying',
                      type: 'tuple[]',
                    },
                  ],
                  internalType: 'struct FullTokenBalance[]',
                  name: 'fullTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Amount is considered to be 10 ** decimals.',
              params: { tokens: 'Array of token addresses.' },
              returns: {
                fullTokenBalances:
                  "Array of FullTokenBalance structs     with 'closest' underlying tokens.",
              },
              notice: 'Fills in FullTokenBalance structs with underlying tokens.',
            },
            'getOwner()': {
              inputs: [],
              name: 'getOwner',
              outputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { owner: 'Owner of the contract' },
            },
            'getPendingOwner()': {
              inputs: [],
              name: 'getPendingOwner',
              outputs: [{ internalType: 'address', name: 'pendingOwner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { pendingOwner: 'Pending owner of the contract' },
            },
            'getTokenAdapter(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenAdapter',
              outputs: [{ internalType: 'address', name: 'tokenAdapter', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              details: 'Gets token adapter address for the given token address.',
              params: { token: 'Address of the token.' },
              returns: { tokenAdapter: 'Token adapter address.' },
            },
            'getTokenAdapterName(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenAdapterName',
              outputs: [{ internalType: 'bytes32', name: 'name', type: 'bytes32' }],
              stateMutability: 'view',
              type: 'function',
              params: { token: 'Address of token.' },
              returns: { name: 'Name of token adapter.' },
            },
            'getTokenHash(address)': {
              inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
              name: 'getTokenHash',
              outputs: [{ internalType: 'bytes32', name: 'hash', type: 'bytes32' }],
              stateMutability: 'view',
              type: 'function',
              params: { token: 'Address of token.' },
              returns: { hash: "Hash of token's bytecode." },
            },
            'getUnderlyingTokenBalances((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getUnderlyingTokenBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: '',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct consisting of token address and absolute amount.',
              },
              returns: {
                _0: "Array of TokenBalance structs with 'closest' underlying token balances.",
              },
            },
            'setAdapters((bytes32,address)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                    { internalType: 'address', name: 'adapter', type: 'address' },
                  ],
                  internalType: 'struct AdapterNameAndAddress[]',
                  name: 'adaptersNamesAndAddresses',
                  type: 'tuple[]',
                },
              ],
              name: 'setAdapters',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                adaptersNamesAndAddresses: "Array of the new adapters' names and addresses.",
              },
              notice: 'Sets adapters (adds, updates or removes).',
            },
            'setOwner()': {
              inputs: [],
              name: 'setOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the pending owner',
              notice: 'Sets owner to the pending owner',
            },
            'setPendingOwner(address)': {
              inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
              name: 'setPendingOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the owner',
              params: { newPendingOwner: 'Address of new pending owner' },
              notice: 'Sets pending owner to the `newPendingOwner` address',
            },
            'setTokenAdapterNames((bytes32,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'bytes32', name: 'hash', type: 'bytes32' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct HashAndAdapterName[]',
                  name: 'hashesAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNames',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: { hashesAndAdapterNames: "Array of hashes and new token adapters' names." },
              notice: "Sets token adapters' names using hashes.",
            },
            'setTokenAdapterNamesByHashes((address,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct TokenAndAdapterName[]',
                  name: 'tokensAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNamesByHashes',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                tokensAndAdapterNames: "Array of tokens addresses and new token adapters' names.",
              },
              notice: "Sets token adapters' names by tokens' hashes using tokens addresses.",
            },
            'setTokenAdapterNamesByTokens((address,bytes32)[])': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'bytes32', name: 'name', type: 'bytes32' },
                  ],
                  internalType: 'struct TokenAndAdapterName[]',
                  name: 'tokensAndAdapterNames',
                  type: 'tuple[]',
                },
              ],
              name: 'setTokenAdapterNamesByTokens',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner.',
              params: {
                tokensAndAdapterNames: "Array of tokens addresses and new token adapters' names.",
              },
              notice: "Sets token adapters' names by tokens addresses.",
            },
          },
        },
        'contracts/router/ProtocolFee.sol:ProtocolFee': {
          source: 'contracts/router/ProtocolFee.sol',
          name: 'ProtocolFee',
          events: {
            'OwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newOwner', type: 'address' },
              ],
              name: 'OwnerSet',
              type: 'event',
              notice: 'Emits old and new owners',
            },
            'PendingOwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldPendingOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newPendingOwner', type: 'address' },
              ],
              name: 'PendingOwnerSet',
              type: 'event',
              notice: 'Emits old and new pending owners',
            },
            'ProtocolFeeDefaultSet(uint256,address,uint256,address)': {
              anonymous: !1,
              inputs: [
                {
                  indexed: !1,
                  internalType: 'uint256',
                  name: 'oldProtocolFeeDefaultShare',
                  type: 'uint256',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldProtocolFeeDefaultBeneficiary',
                  type: 'address',
                },
                {
                  indexed: !1,
                  internalType: 'uint256',
                  name: 'newProtocolFeeDefaultShare',
                  type: 'uint256',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newProtocolFeeDefaultBeneficiary',
                  type: 'address',
                },
              ],
              name: 'ProtocolFeeDefaultSet',
              type: 'event',
              params: {
                newProtocolFeeDefaultBeneficiary: 'New protocol fee default beneficiary',
                newProtocolFeeDefaultShare: 'New protocol fee default share',
                oldProtocolFeeDefaultBeneficiary: 'Old protocol fee default beneficiary',
                oldProtocolFeeDefaultShare: 'Old protocol fee default share',
              },
              notice: 'Emits old and new protocol fee defaults',
            },
            'ProtocolFeeSignerSet(address,address)': {
              anonymous: !1,
              inputs: [
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldProtocolFeeSigner',
                  type: 'address',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newProtocolFeeSigner',
                  type: 'address',
                },
              ],
              name: 'ProtocolFeeSignerSet',
              type: 'event',
              params: {
                newProtocolFeeSigner: 'New protocol fee signature signer',
                oldProtocolFeeSigner: 'Old protocol fee signature signer',
              },
              notice: 'Emits old and new protocol fee signature signer',
            },
          },
          methods: {
            'getOwner()': {
              inputs: [],
              name: 'getOwner',
              outputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { owner: 'Owner of the contract' },
            },
            'getPendingOwner()': {
              inputs: [],
              name: 'getPendingOwner',
              outputs: [{ internalType: 'address', name: 'pendingOwner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { pendingOwner: 'Pending owner of the contract' },
            },
            'getProtocolFeeDefault()': {
              inputs: [],
              name: 'getProtocolFeeDefault',
              outputs: [
                {
                  components: [
                    { internalType: 'uint256', name: 'share', type: 'uint256' },
                    { internalType: 'address', name: 'beneficiary', type: 'address' },
                  ],
                  internalType: 'struct Fee',
                  name: 'protocolFeeDefault',
                  type: 'tuple',
                },
              ],
              stateMutability: 'view',
              type: 'function',
              returns: {
                protocolFeeDefault: 'Protocol fee consisting of its share and beneficiary',
              },
              notice: 'Returns current protocol fee default value',
            },
            'getProtocolFeeSigner()': {
              inputs: [],
              name: 'getProtocolFeeSigner',
              outputs: [{ internalType: 'address', name: 'protocolFeeSigner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { protocolFeeSigner: 'Current signer address' },
              notice: 'Returns current protocol fee signature signer',
            },
            'setOwner()': {
              inputs: [],
              name: 'setOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the pending owner',
              notice: 'Sets owner to the pending owner',
            },
            'setPendingOwner(address)': {
              inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
              name: 'setPendingOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the owner',
              params: { newPendingOwner: 'Address of new pending owner' },
              notice: 'Sets pending owner to the `newPendingOwner` address',
            },
            'setProtocolFeeDefault((uint256,address))': {
              inputs: [
                {
                  components: [
                    { internalType: 'uint256', name: 'share', type: 'uint256' },
                    { internalType: 'address', name: 'beneficiary', type: 'address' },
                  ],
                  internalType: 'struct Fee',
                  name: 'protocolFeeDefault',
                  type: 'tuple',
                },
              ],
              name: 'setProtocolFeeDefault',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: { protocolFeeDefault: 'New base fee defaul value' },
              notice: 'Sets protocol fee default value',
            },
            'setProtocolFeeSigner(address)': {
              inputs: [{ internalType: 'address', name: 'signer', type: 'address' }],
              name: 'setProtocolFeeSigner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: { signer: 'New signer' },
              notice: 'Sets protocol fee signature signer',
            },
          },
        },
        'contracts/router/Router.sol:Router': {
          source: 'contracts/router/Router.sol',
          name: 'Router',
          events: {
            'Executed(address,uint256,uint256,address,uint256,uint256,uint256,uint256,(uint8,(uint256,address),(uint256,address),address,address,bytes),address)':
              {
                anonymous: !1,
                inputs: [
                  { indexed: !0, internalType: 'address', name: 'inputToken', type: 'address' },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'absoluteInputAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'inputBalanceChange',
                    type: 'uint256',
                  },
                  { indexed: !0, internalType: 'address', name: 'outputToken', type: 'address' },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'absoluteOutputAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'returnedAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'protocolFeeAmount',
                    type: 'uint256',
                  },
                  {
                    indexed: !1,
                    internalType: 'uint256',
                    name: 'marketplaceFeeAmount',
                    type: 'uint256',
                  },
                  {
                    components: [
                      { internalType: 'enum SwapType', name: 'swapType', type: 'uint8' },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'protocolFee',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'marketplaceFee',
                        type: 'tuple',
                      },
                      { internalType: 'address', name: 'account', type: 'address' },
                      { internalType: 'address', name: 'caller', type: 'address' },
                      { internalType: 'bytes', name: 'callerCallData', type: 'bytes' },
                    ],
                    indexed: !1,
                    internalType: 'struct SwapDescription',
                    name: 'swapDescription',
                    type: 'tuple',
                  },
                  { indexed: !1, internalType: 'address', name: 'sender', type: 'address' },
                ],
                name: 'Executed',
                type: 'event',
                notice: 'Emits swap info',
              },
            'OwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newOwner', type: 'address' },
              ],
              name: 'OwnerSet',
              type: 'event',
              notice: 'Emits old and new owners',
            },
            'PendingOwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldPendingOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newPendingOwner', type: 'address' },
              ],
              name: 'PendingOwnerSet',
              type: 'event',
              notice: 'Emits old and new pending owners',
            },
            'ProtocolFeeDefaultSet(uint256,address,uint256,address)': {
              anonymous: !1,
              inputs: [
                {
                  indexed: !1,
                  internalType: 'uint256',
                  name: 'oldProtocolFeeDefaultShare',
                  type: 'uint256',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldProtocolFeeDefaultBeneficiary',
                  type: 'address',
                },
                {
                  indexed: !1,
                  internalType: 'uint256',
                  name: 'newProtocolFeeDefaultShare',
                  type: 'uint256',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newProtocolFeeDefaultBeneficiary',
                  type: 'address',
                },
              ],
              name: 'ProtocolFeeDefaultSet',
              type: 'event',
              notice: 'Emits old and new protocol fee defaults',
            },
            'ProtocolFeeSignerSet(address,address)': {
              anonymous: !1,
              inputs: [
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'oldProtocolFeeSigner',
                  type: 'address',
                },
                {
                  indexed: !0,
                  internalType: 'address',
                  name: 'newProtocolFeeSigner',
                  type: 'address',
                },
              ],
              name: 'ProtocolFeeSignerSet',
              type: 'event',
              notice: 'Emits old and new protocol fee signature signer',
            },
          },
          methods: {
            'execute(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),(uint256,address),address,address,bytes),(uint256,bytes),(uint256,bytes))':
              {
                inputs: [
                  {
                    components: [
                      {
                        components: [
                          { internalType: 'address', name: 'token', type: 'address' },
                          { internalType: 'uint256', name: 'amount', type: 'uint256' },
                          { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                        ],
                        internalType: 'struct TokenAmount',
                        name: 'tokenAmount',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'enum PermitType', name: 'permitType', type: 'uint8' },
                          { internalType: 'bytes', name: 'permitCallData', type: 'bytes' },
                        ],
                        internalType: 'struct Permit',
                        name: 'permit',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Input',
                    name: 'input',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'address', name: 'token', type: 'address' },
                      { internalType: 'uint256', name: 'absoluteAmount', type: 'uint256' },
                    ],
                    internalType: 'struct AbsoluteTokenAmount',
                    name: 'output',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'enum SwapType', name: 'swapType', type: 'uint8' },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'protocolFee',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'marketplaceFee',
                        type: 'tuple',
                      },
                      { internalType: 'address', name: 'account', type: 'address' },
                      { internalType: 'address', name: 'caller', type: 'address' },
                      { internalType: 'bytes', name: 'callerCallData', type: 'bytes' },
                    ],
                    internalType: 'struct SwapDescription',
                    name: 'swapDescription',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'uint256', name: 'salt', type: 'uint256' },
                      { internalType: 'bytes', name: 'signature', type: 'bytes' },
                    ],
                    internalType: 'struct AccountSignature',
                    name: 'accountSignature',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                      { internalType: 'bytes', name: 'signature', type: 'bytes' },
                    ],
                    internalType: 'struct ProtocolFeeSignature',
                    name: 'protocolFeeSignature',
                    type: 'tuple',
                  },
                ],
                name: 'execute',
                outputs: [
                  { internalType: 'uint256', name: 'inputBalanceChange', type: 'uint256' },
                  { internalType: 'uint256', name: 'outputBalanceChange', type: 'uint256' },
                ],
                stateMutability: 'payable',
                type: 'function',
                params: {
                  absoluteOutput:
                    'Token and absolute amount requirement     to be returned to the account address',
                  accountSignature:
                    'Signature for the relayed transaction     (checks that account address is the one who actually did a signature)',
                  input:
                    'Token and amount (relative or absolute) to be taken from the account address, also, permit type and call data may provided if required',
                  protocolFeeSignature:
                    'Signature for the discounted protocol fee     (checks that current protocol fee signer is the one who actually did a signature)',
                  swapDescription:
                    'Swap description with the following elements:\\n     - Whether the inputs or outputs are fixed     - Protocol fee share and beneficiary address     - Marketplace fee share and beneficiary address     - Address of the account executing the swap     - Address of the Caller contract to be called     - Calldata for the call to the Caller contract',
                },
                returns: {
                  inputBalanceChange: 'Input token balance change',
                  outputBalanceChange: 'Output token balance change (including fees)',
                },
                notice: 'Main function executing the swaps',
              },
            'getOwner()': {
              inputs: [],
              name: 'getOwner',
              outputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { owner: 'Owner of the contract' },
            },
            'getPendingOwner()': {
              inputs: [],
              name: 'getPendingOwner',
              outputs: [{ internalType: 'address', name: 'pendingOwner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { pendingOwner: 'Pending owner of the contract' },
            },
            'getProtocolFeeDefault()': {
              inputs: [],
              name: 'getProtocolFeeDefault',
              outputs: [
                {
                  components: [
                    { internalType: 'uint256', name: 'share', type: 'uint256' },
                    { internalType: 'address', name: 'beneficiary', type: 'address' },
                  ],
                  internalType: 'struct Fee',
                  name: 'protocolFeeDefault',
                  type: 'tuple',
                },
              ],
              stateMutability: 'view',
              type: 'function',
              returns: {
                protocolFeeDefault: 'Protocol fee consisting of its share and beneficiary',
              },
              notice: 'Returns current protocol fee default value',
            },
            'getProtocolFeeSigner()': {
              inputs: [],
              name: 'getProtocolFeeSigner',
              outputs: [{ internalType: 'address', name: 'protocolFeeSigner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { protocolFeeSigner: 'Current signer address' },
              notice: 'Returns current protocol fee signature signer',
            },
            'hashData(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),(uint256,address),address,address,bytes),uint256)':
              {
                inputs: [
                  {
                    components: [
                      {
                        components: [
                          { internalType: 'address', name: 'token', type: 'address' },
                          { internalType: 'uint256', name: 'amount', type: 'uint256' },
                          { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                        ],
                        internalType: 'struct TokenAmount',
                        name: 'tokenAmount',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'enum PermitType', name: 'permitType', type: 'uint8' },
                          { internalType: 'bytes', name: 'permitCallData', type: 'bytes' },
                        ],
                        internalType: 'struct Permit',
                        name: 'permit',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Input',
                    name: 'input',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'address', name: 'token', type: 'address' },
                      { internalType: 'uint256', name: 'absoluteAmount', type: 'uint256' },
                    ],
                    internalType: 'struct AbsoluteTokenAmount',
                    name: 'output',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'enum SwapType', name: 'swapType', type: 'uint8' },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'protocolFee',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'marketplaceFee',
                        type: 'tuple',
                      },
                      { internalType: 'address', name: 'account', type: 'address' },
                      { internalType: 'address', name: 'caller', type: 'address' },
                      { internalType: 'bytes', name: 'callerCallData', type: 'bytes' },
                    ],
                    internalType: 'struct SwapDescription',
                    name: 'swapDescription',
                    type: 'tuple',
                  },
                  { internalType: 'uint256', name: 'salt', type: 'uint256' },
                ],
                name: 'hashData',
                outputs: [{ internalType: 'bytes32', name: 'hashedData', type: 'bytes32' }],
                stateMutability: 'view',
                type: 'function',
                params: {
                  input: 'Input struct to be hashed.',
                  requiredOutput: 'AbsoluteTokenAmount struct to be hashed.',
                  salt: 'Salt parameter preventing double-spending to be hashed.',
                  swapDescription: 'SwapDescription struct to be hashed.',
                },
                returns: { hashedData: 'Execute data hashed with domainSeparator.' },
              },
            'isHashUsed(bytes32,address)': {
              inputs: [
                { internalType: 'bytes32', name: 'hashToCheck', type: 'bytes32' },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'isHashUsed',
              outputs: [{ internalType: 'bool', name: 'hashUsed', type: 'bool' }],
              stateMutability: 'view',
              type: 'function',
              params: {
                account: 'Address of the hash will be checked for.',
                hashToCheck: 'Hash to be checked.',
              },
              returns: { hashUsed: 'True if hash has already been used by this account address.' },
            },
            'returnLostTokens(address,address,uint256)': {
              inputs: [
                { internalType: 'address', name: 'token', type: 'address' },
                { internalType: 'address payable', name: 'beneficiary', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
              ],
              name: 'returnLostTokens',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: {
                amount: 'Amount of tokens to return',
                beneficiary: 'Address that will receive tokens',
                token: 'Address of token',
              },
              notice: 'Returns tokens mistakenly sent to this contract',
            },
            'setOwner()': {
              inputs: [],
              name: 'setOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the pending owner',
              notice: 'Sets owner to the pending owner',
            },
            'setPendingOwner(address)': {
              inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
              name: 'setPendingOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the owner',
              params: { newPendingOwner: 'Address of new pending owner' },
              notice: 'Sets pending owner to the `newPendingOwner` address',
            },
            'setProtocolFeeDefault((uint256,address))': {
              inputs: [
                {
                  components: [
                    { internalType: 'uint256', name: 'share', type: 'uint256' },
                    { internalType: 'address', name: 'beneficiary', type: 'address' },
                  ],
                  internalType: 'struct Fee',
                  name: 'protocolFeeDefault',
                  type: 'tuple',
                },
              ],
              name: 'setProtocolFeeDefault',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: { protocolFeeDefault: 'New base fee defaul value' },
              notice: 'Sets protocol fee default value',
            },
            'setProtocolFeeSigner(address)': {
              inputs: [{ internalType: 'address', name: 'signer', type: 'address' }],
              name: 'setProtocolFeeSigner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'Can be called only by the owner',
              params: { signer: 'New signer' },
              notice: 'Sets protocol fee signature signer',
            },
          },
        },
        'contracts/router/SignatureVerifier.sol:SignatureVerifier': {
          source: 'contracts/router/SignatureVerifier.sol',
          name: 'SignatureVerifier',
          constructor: {
            inputs: [
              { internalType: 'string', name: 'name', type: 'string' },
              { internalType: 'string', name: 'version', type: 'string' },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
          },
          methods: {
            'hashData(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),(uint256,address),address,address,bytes),uint256)':
              {
                inputs: [
                  {
                    components: [
                      {
                        components: [
                          { internalType: 'address', name: 'token', type: 'address' },
                          { internalType: 'uint256', name: 'amount', type: 'uint256' },
                          { internalType: 'enum AmountType', name: 'amountType', type: 'uint8' },
                        ],
                        internalType: 'struct TokenAmount',
                        name: 'tokenAmount',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'enum PermitType', name: 'permitType', type: 'uint8' },
                          { internalType: 'bytes', name: 'permitCallData', type: 'bytes' },
                        ],
                        internalType: 'struct Permit',
                        name: 'permit',
                        type: 'tuple',
                      },
                    ],
                    internalType: 'struct Input',
                    name: 'input',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'address', name: 'token', type: 'address' },
                      { internalType: 'uint256', name: 'absoluteAmount', type: 'uint256' },
                    ],
                    internalType: 'struct AbsoluteTokenAmount',
                    name: 'output',
                    type: 'tuple',
                  },
                  {
                    components: [
                      { internalType: 'enum SwapType', name: 'swapType', type: 'uint8' },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'protocolFee',
                        type: 'tuple',
                      },
                      {
                        components: [
                          { internalType: 'uint256', name: 'share', type: 'uint256' },
                          { internalType: 'address', name: 'beneficiary', type: 'address' },
                        ],
                        internalType: 'struct Fee',
                        name: 'marketplaceFee',
                        type: 'tuple',
                      },
                      { internalType: 'address', name: 'account', type: 'address' },
                      { internalType: 'address', name: 'caller', type: 'address' },
                      { internalType: 'bytes', name: 'callerCallData', type: 'bytes' },
                    ],
                    internalType: 'struct SwapDescription',
                    name: 'swapDescription',
                    type: 'tuple',
                  },
                  { internalType: 'uint256', name: 'salt', type: 'uint256' },
                ],
                name: 'hashData',
                outputs: [{ internalType: 'bytes32', name: 'hashedData', type: 'bytes32' }],
                stateMutability: 'view',
                type: 'function',
                params: {
                  input: 'Input struct to be hashed.',
                  requiredOutput: 'AbsoluteTokenAmount struct to be hashed.',
                  salt: 'Salt parameter preventing double-spending to be hashed.',
                  swapDescription: 'SwapDescription struct to be hashed.',
                },
                returns: { hashedData: 'Execute data hashed with domainSeparator.' },
              },
            'isHashUsed(bytes32,address)': {
              inputs: [
                { internalType: 'bytes32', name: 'hashToCheck', type: 'bytes32' },
                { internalType: 'address', name: 'account', type: 'address' },
              ],
              name: 'isHashUsed',
              outputs: [{ internalType: 'bool', name: 'hashUsed', type: 'bool' }],
              stateMutability: 'view',
              type: 'function',
              params: {
                account: 'Address of the hash will be checked for.',
                hashToCheck: 'Hash to be checked.',
              },
              returns: { hashUsed: 'True if hash has already been used by this account address.' },
            },
          },
        },
        'contracts/shared/Base.sol:Base': { source: 'contracts/shared/Base.sol', name: 'Base' },
        'contracts/shared/Ownable.sol:Ownable': {
          source: 'contracts/shared/Ownable.sol',
          name: 'Ownable',
          events: {
            'OwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newOwner', type: 'address' },
              ],
              name: 'OwnerSet',
              type: 'event',
              params: { newOwner: "New contract's owner", oldOwner: "Old contract's owner" },
              notice: 'Emits old and new owners',
            },
            'PendingOwnerSet(address,address)': {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: 'address', name: 'oldPendingOwner', type: 'address' },
                { indexed: !0, internalType: 'address', name: 'newPendingOwner', type: 'address' },
              ],
              name: 'PendingOwnerSet',
              type: 'event',
              params: {
                newPendingOwner: 'New pending owner',
                oldPendingOwner: 'Old pending owner',
              },
              notice: 'Emits old and new pending owners',
            },
          },
          methods: {
            'getOwner()': {
              inputs: [],
              name: 'getOwner',
              outputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { owner: 'Owner of the contract' },
            },
            'getPendingOwner()': {
              inputs: [],
              name: 'getPendingOwner',
              outputs: [{ internalType: 'address', name: 'pendingOwner', type: 'address' }],
              stateMutability: 'view',
              type: 'function',
              returns: { pendingOwner: 'Pending owner of the contract' },
            },
            'setOwner()': {
              inputs: [],
              name: 'setOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the pending owner',
              notice: 'Sets owner to the pending owner',
            },
            'setPendingOwner(address)': {
              inputs: [{ internalType: 'address', name: 'newPendingOwner', type: 'address' }],
              name: 'setPendingOwner',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
              details: 'The function is callable only by the owner',
              params: { newPendingOwner: 'Address of new pending owner' },
              notice: 'Sets pending owner to the `newPendingOwner` address',
            },
          },
        },
        'contracts/tokenAdapters/TokenAdapter.sol:TokenAdapter': {
          source: 'contracts/tokenAdapters/TokenAdapter.sol',
          name: 'TokenAdapter',
          title: 'Token adapter abstract contract.',
          author: 'Igor Sobolev <sobolev@zerion.io>',
          details:
            'getUnderlyingTokenBalances() function MUST be implemented. getName(), getSymbol(), getDecimals() functions or getMetadata() function may be overridden.',
          methods: {
            'getMetadata((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getMetadata',
              outputs: [
                {
                  components: [
                    { internalType: 'string', name: 'name', type: 'string' },
                    { internalType: 'string', name: 'symbol', type: 'string' },
                    { internalType: 'uint8', name: 'decimals', type: 'uint8' },
                  ],
                  internalType: 'struct ERC20Metadata',
                  name: 'metadata',
                  type: 'tuple',
                },
              ],
              stateMutability: 'view',
              type: 'function',
              params: { tokenBalance: 'TokenBalance struct with token info to get metadata for.' },
              returns: { metadata: 'ERC20Metadata struct with IERC20-style token info.' },
            },
            'getUnderlyingTokenBalances((address,int256))': {
              inputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance',
                  name: 'tokenBalance',
                  type: 'tuple',
                },
              ],
              name: 'getUnderlyingTokenBalances',
              outputs: [
                {
                  components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'int256', name: 'amount', type: 'int256' },
                  ],
                  internalType: 'struct TokenBalance[]',
                  name: 'underlyingTokenBalances',
                  type: 'tuple[]',
                },
              ],
              stateMutability: 'nonpayable',
              type: 'function',
              params: {
                tokenBalance:
                  'TokenBalance struct with token info to get underlying token balances for.',
              },
              returns: {
                underlyingTokenBalances:
                  'Array of TokenBalance structs with underlying token balances.',
              },
            },
          },
        },
      },
      wt = new Ke({
        routes: [
          { path: '/', component: Tt, props: () => ({ json: bt }) },
          { path: '*', component: mt, props: (e) => ({ json: bt[e.path.slice(1)] }) },
        ],
      });
    new a.a({
      el: '#app',
      router: wt,
      mounted() {
        document.dispatchEvent(new Event('render-event'));
      },
      render: (e) => e(Xe),
    });
  },
  function (e, t, n) {
    'use strict';
    function a(e, t) {
      for (var n = [], a = {}, r = 0; r < t.length; r++) {
        var s = t[r],
          o = s[0],
          i = { id: e + ':' + r, css: s[1], media: s[2], sourceMap: s[3] };
        a[o] ? a[o].parts.push(i) : n.push((a[o] = { id: o, parts: [i] }));
      }
      return n;
    }
    n.r(t),
      n.d(t, 'default', function () {
        return y;
      });
    var r = 'undefined' != typeof document;
    if ('undefined' != typeof DEBUG && DEBUG && !r)
      throw new Error(
        "vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.",
      );
    var s = {},
      o = r && (document.head || document.getElementsByTagName('head')[0]),
      i = null,
      p = 0,
      u = !1,
      l = function () {},
      d = null,
      c =
        'undefined' != typeof navigator && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase());
    function y(e, t, n, r) {
      (u = n), (d = r || {});
      var o = a(e, t);
      return (
        m(o),
        function (t) {
          for (var n = [], r = 0; r < o.length; r++) {
            var i = o[r];
            (p = s[i.id]).refs--, n.push(p);
          }
          t ? m((o = a(e, t))) : (o = []);
          for (r = 0; r < n.length; r++) {
            var p;
            if (0 === (p = n[r]).refs) {
              for (var u = 0; u < p.parts.length; u++) p.parts[u]();
              delete s[p.id];
            }
          }
        }
      );
    }
    function m(e) {
      for (var t = 0; t < e.length; t++) {
        var n = e[t],
          a = s[n.id];
        if (a) {
          a.refs++;
          for (var r = 0; r < a.parts.length; r++) a.parts[r](n.parts[r]);
          for (; r < n.parts.length; r++) a.parts.push(h(n.parts[r]));
          a.parts.length > n.parts.length && (a.parts.length = n.parts.length);
        } else {
          var o = [];
          for (r = 0; r < n.parts.length; r++) o.push(h(n.parts[r]));
          s[n.id] = { id: n.id, refs: 1, parts: o };
        }
      }
    }
    function f() {
      var e = document.createElement('style');
      return (e.type = 'text/css'), o.appendChild(e), e;
    }
    function h(e) {
      var t,
        n,
        a = document.querySelector('style[data-vue-ssr-id~="' + e.id + '"]');
      if (a) {
        if (u) return l;
        a.parentNode.removeChild(a);
      }
      if (c) {
        var r = p++;
        (a = i || (i = f())), (t = T.bind(null, a, r, !1)), (n = T.bind(null, a, r, !0));
      } else
        (a = f()),
          (t = b.bind(null, a)),
          (n = function () {
            a.parentNode.removeChild(a);
          });
      return (
        t(e),
        function (a) {
          if (a) {
            if (a.css === e.css && a.media === e.media && a.sourceMap === e.sourceMap) return;
            t((e = a));
          } else n();
        }
      );
    }
    var v,
      g =
        ((v = []),
        function (e, t) {
          return (v[e] = t), v.filter(Boolean).join('\n');
        });
    function T(e, t, n, a) {
      var r = n ? '' : a.css;
      if (e.styleSheet) e.styleSheet.cssText = g(t, r);
      else {
        var s = document.createTextNode(r),
          o = e.childNodes;
        o[t] && e.removeChild(o[t]), o.length ? e.insertBefore(s, o[t]) : e.appendChild(s);
      }
    }
    function b(e, t) {
      var n = t.css,
        a = t.media,
        r = t.sourceMap;
      if (
        (a && e.setAttribute('media', a),
        d.ssrId && e.setAttribute('data-vue-ssr-id', t.id),
        r &&
          ((n += '\n/*# sourceURL=' + r.sources[0] + ' */'),
          (n +=
            '\n/*# sourceMappingURL=data:application/json;base64,' +
            btoa(unescape(encodeURIComponent(JSON.stringify(r)))) +
            ' */')),
        e.styleSheet)
      )
        e.styleSheet.cssText = n;
      else {
        for (; e.firstChild; ) e.removeChild(e.firstChild);
        e.appendChild(document.createTextNode(n));
      }
    }
  },
]);
