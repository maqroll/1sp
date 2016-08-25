;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var Engine, Frontend, JobStatus, JobWatcher, Location, config, iced, keymodes, sc, __iced_k, __iced_k_noop, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  iced = require('iced-coffee-script/lib/coffee-script/iced').runtime;
  __iced_k = __iced_k_noop = function() {};

  Location = require('./lib/location.iced').Location;

  Engine = require('./lib/engine.iced').Engine;

  sc = require('./lib/status.iced').codes;

  config = require('./lib/config.iced').config;

  _ref = require('./lib/job_watcher.iced'), JobWatcher = _ref.JobWatcher, JobStatus = _ref.JobStatus;

  keymodes = require('./lib/derive.iced').keymodes;

  Frontend = (function() {
    function Frontend() {
      this.join_cb = __bind(this.join_cb, this);
      this.maybe_show_saved_hosts = __bind(this.maybe_show_saved_hosts, this);
      this.login_cb = __bind(this.login_cb, this);
      this.logout_cb = __bind(this.logout_cb, this);
      this.jw = new JobWatcher();
      this.e = null;
      this.create_engine();
      this.attach_ux_events();
      this.first_select();
    }

    Frontend.prototype.first_select = function() {
      if ($("#input-email").hasClass("modified") || $("#input-passphrase").hasClass("modified")) {
        if (!$("#input-email").hasClass("modified")) {
          return $("#input-email").focus();
        } else if (!$("#input-passphrase").hasClass("modified")) {
          return $("#input-passphrase").focus();
        } else {
          return $("#btn-login").focus();
        }
      }
    };

    Frontend.prototype.fill_both = function(key, val, input_id) {
      /* fills both the engine and the UI*/

      this.e.set(key, val);
      $("#" + input_id).val(this.e.get(key)).addClass("modified");
      return this.update_login_button();
    };

    Frontend.prototype.attach_ux_select = function(f) {
      var eng_field, html_field,
        _this = this;
      html_field = "#input-" + f;
      eng_field = f.replace("-", "_");
      return $(html_field).change(function() {
        return _this.e.set(eng_field, parseInt($(html_field).val()));
      });
    };

    Frontend.prototype.input_host_event = function() {
      var after, before;
      console.log('okay');
      before = this.e.get('host');
      this.e.set("host", $('#input-host').val());
      after = this.e.get('host');
      if (before !== after) {
        $('#input-saved-host').val('');
      }
      this.update_save_button();
      return this.e.poke();
    };

    Frontend.prototype.attach_ux_events = function() {
      var basic_inputs, f, _i, _len, _ref1,
        _this = this;
      basic_inputs = ['#input-email', '#input-passphrase', '#input-host'];
      $(basic_inputs.join(',')).focus(function() {
        if (!$(this).hasClass('modified')) {
          $(this).val('');
          return $(this).addClass('modified');
        }
      });
      $('#input-email').keyup(function() {
        _this.e.set("email", $('#input-email').val());
        _this.update_login_button();
        return _this.e.poke();
      });
      $('#input-passphrase').keyup(function() {
        _this.e.set("passphrase", $('#input-passphrase').val());
        _this.update_login_button();
        return _this.e.poke();
      });
      $('#input-host').keyup(this.input_host_event.bind(this));
      $('#input-notes').keyup(function() {
        _this.e.set("notes", $('#input-notes').val());
        _this.update_save_button();
        return _this.e.poke();
      });
      _ref1 = ['generation', 'security-bits', 'algo-version', 'length', 'num-symbols'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        f = _ref1[_i];
        this.attach_ux_select(f);
      }
      $('#btn-hide-passphrase').click(function() {
        $('#input-passphrase').attr("type", "password");
        $('#btn-hide-passphrase').hide();
        $('#btn-show-passphrase').show();
        return _this.e.poke();
      });
      $('#btn-show-passphrase').click(function() {
        $('#input-passphrase').attr("type", "text");
        $('#btn-show-passphrase').hide();
        $('#btn-hide-passphrase').show();
        return _this.e.poke();
      });
      $('#btn-login').click(function() {
        $('#btn-login').attr('disabled', 'disabled');
        _this.hide_login_dialogs();
        _this.disable_login_credentials();
        _this.e.poke();
        return _this.e.login(_this.login_cb);
      });
      $('#btn-logout').click(function() {
        $('#btn-logout').attr('disabled', 'disabled');
        _this.hide_login_dialogs();
        return _this.e.logout(_this.logout_cb);
      });
      $('#input-passphrase, #input-email').focus(function() {
        $('#input-email').removeClass('error');
        return $('#input-passphrase').removeClass('error');
      });
      $('#btn-join').click(function() {
        $('#input-email').removeClass('error');
        $('#input-passphrase').removeClass('error');
        $('#btn-join').attr('disabled', 'disabled');
        _this.disable_login_credentials();
        _this.e.signup(_this.join_cb);
        return _this.e.poke();
      });
      $('#faq-link').click(function() {
        $('#faq').show();
        $('#faq-link').parent().hide();
        return _this.e.poke();
      });
      $('#output-password').click(function() {
        $('#output-password').select();
        return _this.e.poke();
      });
      $("#input-saved-host").change(function() {
        var v;
        v = $("#input-saved-host").val();
        if (v && v.length) {
          _this.load_record_by_host(v);
        } else {
          _this.clear_host_notes_and_output();
        }
        return _this.e.poke();
      });
      $("#input-security-bits, #input-generation,\n#input-length, #input-host, #input-num-symbols,\n#input-notes, #input-algo-version").change(function() {
        return _this.update_save_button();
      });
      $("#input-algo-version").change(function() {
        var bits, cfg;
        cfg = config.legacy;
        bits = (_this.e.get("algo_version")) === cfg.algo_version ? cfg.security_bits : (_this.e.get("security_bits")) + 1;
        return _this.fill_both("security_bits", bits, "input-security-bits");
      });
      $("#btn-save").click(function() {
        var status, ___iced_passed_deferral, __iced_deferrals, __iced_k;
        __iced_k = __iced_k_noop;
        ___iced_passed_deferral = iced.findDeferral(arguments);
        _this.e.poke();
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral
          });
          _this.e.push(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return status = arguments[0];
              };
            })(),
            lineno: 146
          }));
          __iced_deferrals._fulfill();
        })(function() {
          if (status !== sc.OK) {
            return alert("Unhandled push status " + status);
          } else {
            $("#btn-save").attr("disabled", "disabled");
            return _this.maybe_show_saved_hosts();
          }
        });
      });
      return $("#btn-remove").click(function() {
        var status, ___iced_passed_deferral, __iced_deferrals, __iced_k;
        __iced_k = __iced_k_noop;
        ___iced_passed_deferral = iced.findDeferral(arguments);
        _this.e.poke();
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral
          });
          _this.e.remove(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return status = arguments[0];
              };
            })(),
            lineno: 155
          }));
          __iced_deferrals._fulfill();
        })(function() {
          if (status !== sc.OK) {
            return alert("Unhandled remove status " + status);
          } else {
            _this.clear_host_notes_and_output();
            return _this.maybe_show_saved_hosts();
          }
        });
      });
    };

    Frontend.prototype.toggle_remove_button = function(f) {
      var val;
      val = f ? false : "disabled";
      return $('#btn-remove').attr("disabled", val);
    };

    Frontend.prototype.update_save_button = function() {
      var h;
      h = this.e.get("host");
      if (h && h.length) {
        return $("#btn-save").attr("disabled", false);
      } else {
        return $("#btn-save").attr("disabled", "disabled");
      }
    };

    Frontend.prototype.load_field = function(r, f, dflt) {
      var v;
      if (((v = r[f]) == null) && (dflt != null)) {
        v = dflt;
      }
      return this.fill_both(f, v, "input-" + (f.replace('_', '-')));
    };

    Frontend.prototype.load_record_by_host = function(h) {
      var f, r, _i, _len, _ref1;
      r = this.e.get_record(h);
      this.load_field(r, "algo_version", config.input.defaults.algo_version);
      _ref1 = ["security_bits", "generation", "length", "host", "num_symbols"];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        f = _ref1[_i];
        this.load_field(r, f);
      }
      this.load_field(r, "notes", "");
      $('#btn-save').attr('disabled', 'disabled');
      return this.toggle_remove_button(true);
    };

    Frontend.prototype.logout_cb = function(status) {
      if (status !== sc.OK) {
        alert("Unhandled logout status " + status);
      }
      return this.clear_all_but_email();
    };

    Frontend.prototype.login_cb = function(status) {
      if (status === sc.OK) {
        $('#input-email').addClass('success');
        $('#input-passphrase').addClass('success');
        this.update_login_button();
        this.maybe_show_saved_hosts();
        $("#save-row").show();
        this.fill_both('host', '', "input-host");
        this.update_output_pw('');
        return this.update_save_button();
      } else {
        this.enable_login_credentials();
        if (status === sc.BAD_ARGS) {
          return alert("Bad arguments; pick a real email address and passphrase");
        } else if (status === sc.BAD_LOGIN) {
          return this.show_bad_login_dialog();
        } else if (status === sc.SERVER_DOWN) {
          this.show_bad_general_dialog();
          return $("#bad-general-msg").html("The server was unreachable. Perhaps you're offline?\nYou can still use One Shall Pass, assuming you can recall\nthe names of your hosts. All hashing is done in the browser.");
        } else {
          return alert("Unhandled login error code: " + status);
        }
      }
    };

    Frontend.prototype.maybe_show_saved_hosts = function() {
      var r, recs;
      recs = this.e.get_stored_records();
      if (recs.length) {
        recs = recs.sort(function(a, b) {
          if (a.host < b.host) {
            return -1;
          } else {
            return 1;
          }
        });
        $(".saved-hosts-bundle").show();
        $("#input-saved-host").html("<option value=\"\">- choose -</option>" + ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = recs.length; _i < _len; _i++) {
            r = recs[_i];
            _results.push("<option value=\"" + r.host + "\"\n>" + r.host + "</option>");
          }
          return _results;
        })()).join("\n"));
        return $("#input-saved-host").focus();
      } else {
        return $(".saved-hosts-bundle").slideUp();
      }
    };

    Frontend.prototype.join_cb = function(status) {
      this.enable_login_credentials();
      if (status === sc.OK) {
        this.hide_bad_login_dialog();
        this.show_good_join_dialog();
        $('.join-email').html(this.e.get('email'));
      } else {
        this.hide_bad_login_dialog();
        this.show_bad_general_dialog();
        if (status === sc.SERVER_DOWN) {
          $("#bad-general-msg").html("The server was unreachable and joining is not possible. Try again when connected?");
        } else if (status === sc.BAD_ARGS) {
          $("#bad-general-msg").html("The args you passed were not legit.");
        } else {
          alert("Unhandled join error code: " + status);
        }
      }
      return this.update_login_button();
    };

    Frontend.prototype.show_bad_general_dialog = function() {
      return $("bad-general-dialog").show();
    };

    Frontend.prototype.show_good_join_dialog = function() {
      return $("#good-join-dialog").show();
    };

    Frontend.prototype.disable_login_credentials = function() {
      return $("#input-passphrase, #input-email").attr("disabled", "disabled");
    };

    Frontend.prototype.enable_login_credentials = function() {
      return $("#input-passphrase, #input-email").attr("disabled", false);
    };

    Frontend.prototype.hide_login_dialogs = function() {
      this.hide_bad_login_dialog();
      this.hide_good_join_dialog();
      return this.hide_bad_general_dialog();
    };

    Frontend.prototype.hide_good_join_dialog = function() {
      return $("#good-join-dialog").hide();
    };

    Frontend.prototype.hide_bad_general_dialog = function() {
      return $("#bad-general-dialog").hide();
    };

    Frontend.prototype.show_bad_login_dialog = function() {
      $("#bad-login-dialog").show();
      $('#input-email').addClass('error');
      $('#input-passphrase').addClass('error');
      this.hide_good_join_dialog();
      return this.hide_bad_general_dialog();
    };

    Frontend.prototype.hide_bad_login_dialog = function() {
      $("#bad-login-dialog").hide();
      return $('#btn-join').attr('disabled', false);
    };

    Frontend.prototype.create_engine = function() {
      var opts, p,
        _this = this;
      opts = typeof engine_opts !== "undefined" && engine_opts !== null ? engine_opts : {};
      opts.presets = {
        algo_version: 3
      };
      opts.hooks = {
        on_compute_step: function(keymode, step, ts) {
          return _this.on_compute_step(keymode, step, ts);
        },
        on_compute_done: function(keymode, key) {
          return _this.on_compute_done(keymode, key);
        },
        on_timeout: function() {
          return _this.on_timeout();
        }
      };
      p = new Location(window.location).decode_url_params();
      this.e = new Engine(opts);
      if (p.passphrase) {
        this.fill_both("passphrase", p.passphrase, "input-passphrase");
      }
      if (p.email) {
        this.fill_both("email", p.email, "input-email");
      }
      if (p.host) {
        this.fill_both("host", p.host, "input-host");
      }
      if (p.security_bits) {
        this.fill_both("security_bits", p.security_bits, "input-security-bits");
      }
      if (p.generation) {
        this.fill_both("generation", p.generation, "input-generation");
      }
      if (p.length) {
        this.fill_both("length", p.length, "input-length");
      }
      if (p.num_symbols) {
        return this.fill_both("num_symbols", p.num_symbols, "input-num-symbols");
      }
    };

    Frontend.prototype.update_login_button = function() {
      this.hide_bad_login_dialog();
      if (this.e.is_logged_in()) {
        $('#btn-logout').show();
        $('#btn-logout').attr("disabled", false);
        $('#btn-login').hide();
        $('#notes-row').show();
      } else {
        $('#btn-logout').hide();
        $('#btn-login').show();
        $('#notes-row').hide();
      }
      return $('#btn-login').attr("disabled", !(this.e.get('email') && this.e.get('passphrase')));
    };

    Frontend.prototype.keymode_name = function(keymode) {
      switch (keymode) {
        case keymodes.WEB_PW:
          return "base hash (" + (this.e.get('security_bits')) + "-bit)";
        case keymodes.LOGIN_PW:
          return "server password";
        case keymodes.RECORD_AES:
          return "encryption key";
        case keymodes.RECORD_HMAC:
          return "authentication key";
        default:
          return 'unknown keymode';
      }
    };

    Frontend.prototype.on_compute_step = function(keymode, step, total_steps) {
      var txt;
      if (keymode === keymodes.WEB_PW) {
        this.update_output_pw('');
      }
      txt = "" + (this.keymode_name(keymode)) + " (" + (step + 1) + "/" + (total_steps + 1) + ")";
      return this.jw_update(keymode, {
        status: JobStatus.RUNNING,
        frac_done: step / total_steps,
        txt: txt
      });
    };

    Frontend.prototype.on_compute_done = function(keymode, key) {
      this.jw_update(keymode, {
        status: JobStatus.COMPLETE,
        frac_done: 1.0,
        txt: "" + (this.keymode_name(keymode))
      });
      if (keymode === keymodes.WEB_PW) {
        return this.update_output_pw(key);
      }
    };

    Frontend.prototype.update_output_pw = function(key) {


    chrome.tabs.executeScript({
        code: 'var foco = document.querySelectorAll("input[type=password]"); console.log(foco.length); if (foco.length > 0) {foco[0].value = "' + key + '";}'
      });

      $('#output-password').val(key);
      if (key && key.length) {
        if (this.pw_effect_timeout) {
          clearTimeout(this.pw_effect_timeout);
        }
        $('#output-password').addClass("just-changed");
        return this.pw_effect_timeout = setTimeout((function() {
          return $('#output-password').removeClass("just-changed");
        }), 500);
      }
    };

    Frontend.prototype.jw_update = function(label, changes) {
      this.jw.update(label, changes);
      return this.draw_job_watcher(label);
    };

    Frontend.prototype.draw_job_watcher = function(label) {
      var bar, bar_width, el, j, k, v;
      el = $("#job-" + label);
      if (!el.length) {
        $('#job-watcher').prepend("<div class=\"job\" id=\"job-" + label + "\" style=\"display:none;\">job " + label + "</div>");
        el = $("#job-" + label);
        el.show();
      }
      j = this.jw.getInfo(label);
      el.html("<div class=\"job-wrapper-status-" + j.status + "\">\n  <div class=\"job-status\">" + ((function() {
        var _results;
        _results = [];
        for (k in JobStatus) {
          v = JobStatus[k];
          if (v === j.status) {
            _results.push(k);
          }
        }
        return _results;
      })()) + "</div>\n  <div class=\"job-txt\">" + j.txt + "</div>\n  <div class=\"job-completion\">\n    <div class=\"job-completion-bar\"></div>\n  </div>\n  <div class=\"clear\"></div>\n</div>");
      bar_width = Math.floor(j.frac_done * $("#job-" + label + " .job-completion").width());
      return bar = $("#job-watcher #job-" + label + " .job-completion-bar").width(bar_width);
    };

    Frontend.prototype.on_timeout = function() {
      return this.clear_all_but_email();
    };

    Frontend.prototype.clear_host_notes_and_output = function() {
      this.fill_both('host', '', "input-host");
      this.fill_both('notes', '', "input-notes");
      this.update_output_pw('');
      return this.toggle_remove_button(false);
    };

    Frontend.prototype.clear_all_but_email = function() {
      $('#input-email').removeClass('success').removeClass('error');
      $('#input-passphrase').removeClass('success').removeClass('error');
      $("#save-row").slideUp();
      $(".saved-hosts-bundle").slideUp();
      $('#btn-login').attr('disabled', false);
      this.enable_login_credentials();
      this.fill_both('passphrase', '', "input-passphrase");
      this.clear_host_notes_and_output();
      return this.update_login_button();
    };

    return Frontend;

  })();

  $(function() {
    window.Frontend = Frontend;
    return window.fe = new Frontend();
  });

}).call(this);


},{"./lib/location.iced":2,"./lib/engine.iced":3,"./lib/status.iced":4,"./lib/config.iced":5,"./lib/job_watcher.iced":6,"./lib/derive.iced":7,"iced-coffee-script/lib/coffee-script/iced":8}],9:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
(function(process){// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var generator,
    __slice = [].slice;



  exports.generator = generator = function(intern, compiletime, runtime) {
    var C, Deferrals, Rendezvous, exceptionHandler, findDeferral, stackWalk;
    compiletime.transform = function(x, options) {
      return x.icedTransform(options);
    };
    compiletime["const"] = C = {
      k: "__iced_k",
      k_noop: "__iced_k_noop",
      param: "__iced_p_",
      ns: "iced",
      runtime: "runtime",
      Deferrals: "Deferrals",
      deferrals: "__iced_deferrals",
      fulfill: "_fulfill",
      b_while: "_break",
      t_while: "_while",
      c_while: "_continue",
      n_while: "_next",
      n_arg: "__iced_next_arg",
      defer_method: "defer",
      slot: "__slot",
      assign_fn: "assign_fn",
      autocb: "autocb",
      retslot: "ret",
      trace: "__iced_trace",
      passed_deferral: "__iced_passed_deferral",
      findDeferral: "findDeferral",
      lineno: "lineno",
      parent: "parent",
      filename: "filename",
      funcname: "funcname",
      catchExceptions: 'catchExceptions',
      runtime_modes: ["node", "inline", "window", "none", "browserify"],
      trampoline: "trampoline"
    };
    intern.makeDeferReturn = function(obj, defer_args, id, trace_template, multi) {
      var k, ret, trace, v;
      trace = {};
      for (k in trace_template) {
        v = trace_template[k];
        trace[k] = v;
      }
      trace[C.lineno] = defer_args != null ? defer_args[C.lineno] : void 0;
      ret = function() {
        var inner_args, o, _ref;
        inner_args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (defer_args != null) {
          if ((_ref = defer_args.assign_fn) != null) {
            _ref.apply(null, inner_args);
          }
        }
        if (obj) {
          o = obj;
          if (!multi) {
            obj = null;
          }
          return o._fulfill(id, trace);
        } else {
          return intern._warn("overused deferral at " + (intern._trace_to_string(trace)));
        }
      };
      ret[C.trace] = trace;
      return ret;
    };
    intern.__c = 0;
    intern.tickCounter = function(mod) {
      intern.__c++;
      if ((intern.__c % mod) === 0) {
        intern.__c = 0;
        return true;
      } else {
        return false;
      }
    };
    intern.__active_trace = null;
    intern._trace_to_string = function(tr) {
      var fn;
      fn = tr[C.funcname] || "<anonymous>";
      return "" + fn + " (" + tr[C.filename] + ":" + (tr[C.lineno] + 1) + ")";
    };
    intern._warn = function(m) {
      return typeof console !== "undefined" && console !== null ? console.log("ICED warning: " + m) : void 0;
    };
    runtime.trampoline = function(fn) {
      if (!intern.tickCounter(500)) {
        return fn();
      } else if (typeof process !== "undefined" && process !== null) {
        return process.nextTick(fn);
      } else {
        return setTimeout(fn);
      }
    };
    runtime.Deferrals = Deferrals = (function() {
      function Deferrals(k, trace) {
        this.trace = trace;
        this.continuation = k;
        this.count = 1;
        this.ret = null;
      }

      Deferrals.prototype._call = function(trace) {
        var c;
        if (this.continuation) {
          intern.__active_trace = trace;
          c = this.continuation;
          this.continuation = null;
          return c(this.ret);
        } else {
          return intern._warn("Entered dead await at " + (intern._trace_to_string(trace)));
        }
      };

      Deferrals.prototype._fulfill = function(id, trace) {
        var _this = this;
        if (--this.count > 0) {

        } else {
          return runtime.trampoline((function() {
            return _this._call(trace);
          }));
        }
      };

      Deferrals.prototype.defer = function(args) {
        var self;
        this.count++;
        self = this;
        return intern.makeDeferReturn(self, args, null, this.trace);
      };

      return Deferrals;

    })();
    runtime.findDeferral = findDeferral = function(args) {
      var a, _i, _len;
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        a = args[_i];
        if (a != null ? a[C.trace] : void 0) {
          return a;
        }
      }
      return null;
    };
    runtime.Rendezvous = Rendezvous = (function() {
      var RvId;

      function Rendezvous() {
        this.completed = [];
        this.waiters = [];
        this.defer_id = 0;
        this[C.deferrals] = this;
      }

      RvId = (function() {
        function RvId(rv, id, multi) {
          this.rv = rv;
          this.id = id;
          this.multi = multi;
        }

        RvId.prototype.defer = function(defer_args) {
          return this.rv._deferWithId(this.id, defer_args, this.multi);
        };

        return RvId;

      })();

      Rendezvous.prototype.wait = function(cb) {
        var x;
        if (this.completed.length) {
          x = this.completed.shift();
          return cb(x);
        } else {
          return this.waiters.push(cb);
        }
      };

      Rendezvous.prototype.defer = function(defer_args) {
        var id;
        id = this.defer_id++;
        return this.deferWithId(id, defer_args);
      };

      Rendezvous.prototype.id = function(i, multi) {
        var ret;
        if (multi == null) {
          multi = false;
        }
        ret = {};
        ret[C.deferrals] = new RvId(this, i, multi);
        return ret;
      };

      Rendezvous.prototype._fulfill = function(id, trace) {
        var cb;
        if (this.waiters.length) {
          cb = this.waiters.shift();
          return cb(id);
        } else {
          return this.completed.push(id);
        }
      };

      Rendezvous.prototype._deferWithId = function(id, defer_args, multi) {
        this.count++;
        return intern.makeDeferReturn(this, defer_args, id, {}, multi);
      };

      return Rendezvous;

    })();
    runtime.stackWalk = stackWalk = function(cb) {
      var line, ret, tr, _ref;
      ret = [];
      tr = cb ? cb[C.trace] : intern.__active_trace;
      while (tr) {
        line = "   at " + (intern._trace_to_string(tr));
        ret.push(line);
        tr = tr != null ? (_ref = tr[C.parent]) != null ? _ref[C.trace] : void 0 : void 0;
      }
      return ret;
    };
    runtime.exceptionHandler = exceptionHandler = function(err, logger) {
      var stack;
      if (!logger) {
        logger = console.log;
      }
      logger(err.stack);
      stack = stackWalk();
      if (stack.length) {
        logger("Iced callback trace:");
        return logger(stack.join("\n"));
      }
    };
    return runtime.catchExceptions = function(logger) {
      return typeof process !== "undefined" && process !== null ? process.on('uncaughtException', function(err) {
        exceptionHandler(err, logger);
        return process.exit(1);
      }) : void 0;
    };
  };

  exports.runtime = {};

  generator(this, exports, exports.runtime);

}).call(this);

})(require("__browserify_process"))
},{"__browserify_process":9}],4:[function(require,module,exports){
(function() {


  exports.codes = {
    OK: 0,
    LOGGED_IN: 1,
    ERROR: 100,
    SERVER_DOWN: 101,
    BAD_LOGIN: 102,
    BAD_ARGS: 103,
    BAD_FETCH: 104,
    BAD_DERIVE: 105,
    BAD_DECODE: 106
  };

}).call(this);


},{}],2:[function(require,module,exports){
(function() {
  var Location;



  exports.Location = Location = (function() {
    function Location(_o) {
      this._o = _o;
      this._u = this.decode_url_params();
    }

    Location.prototype.decode_url_params = function() {
      var decode, m, pl, q, ret, search;
      ret = {};
      pl = /\+/g;
      search = /([^&=]+)=?([^&]*)/g;
      decode = function(s) {
        return decodeURIComponent(s.replace(pl, " "));
      };
      q = this._o.hash.substring(1);
      while ((m = search.exec(q))) {
        ret[decode(m[1])] = decode(m[2]);
      }
      return ret;
    };

    Location.prototype.get = function(k) {
      return this._u[k];
    };

    return Location;

  })();

}).call(this);


},{}],6:[function(require,module,exports){
(function() {
  var Job, JobStatus, JobWatcher;



  JobStatus = {
    READY: 0,
    RUNNING: 1,
    COMPLETE: 2,
    ERROR: 3,
    INFO: 4
  };

  Job = (function() {
    function Job(label) {
      this.label = label;
      this.txt = label;
      this.frac_done = 0;
      this.status = JobStatus.READY;
      this.lastChange = Date.now();
    }

    Job.prototype.update = function(k, v) {
      if (this[k] == null) {
        throw new Error("JobWatcher doesn't understand " + k + " = " + v);
      }
      this[k] = v;
      return this.lastChange = Date.now();
    };

    return Job;

  })();

  JobWatcher = (function() {
    function JobWatcher() {
      this.jobs = {};
    }

    JobWatcher.prototype.update = function(label, changes) {
      var k, v, _results;
      if (this.jobs[label] == null) {
        this.jobs[label] = new Job(label);
      }
      _results = [];
      for (k in changes) {
        v = changes[k];
        _results.push(this.jobs[label].update(k, v));
      }
      return _results;
    };

    JobWatcher.prototype.getInfo = function(label) {
      return this.jobs[label];
    };

    return JobWatcher;

  })();

  exports.JobWatcher = JobWatcher;

  exports.JobStatus = JobStatus;

}).call(this);


},{}],5:[function(require,module,exports){
(function() {


  exports.config = {
    input: {
      defaults: {
        algo_version: 3,
        security_bits: 8,
        generation: 1,
        length: 12,
        num_symbols: 0,
        notes: null
      }
    },
    derive: {
      initial_delay: 500,
      sync_initial_delay: 200,
      internal_delay: 1,
      iters_per_slot: 10
    },
    pw: {
      min_size: 8,
      max_size: 16
    },
    timeouts: {
      cache: 5 * 60,
      document: 2 * 60,
      input: 5 * 60
    },
    server: {
      host: "oneshallpass.com",
      generation: 1,
      algo_version: 3,
      security_bits: 7,
      length: 32,
      num_symbols: 0
    },
    legacy: {
      algo_version: 1,
      security_bits: 7
    }
  };

}).call(this);


},{}],3:[function(require,module,exports){
(function() {
  var Cache, Client, Engine, Input, Record, Timer, Timers, Version1Obj, Version3Obj, VersionObj, config, copy_dict, derive, iced, input_clean, input_clean_preserve_case, input_trim, util, __iced_k, __iced_k_noop, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  iced = require('iced-coffee-script/lib/coffee-script/iced').runtime;
  __iced_k = __iced_k_noop = function() {};

  util = require('./util.iced');

  config = require('./config.iced').config;

  derive = require('./derive.iced');

  _ref = require('./client.iced'), Client = _ref.Client, Record = _ref.Record;

  Cache = (function() {
    function Cache() {
      this._c = {};
    }

    Cache.prototype.timeout = function() {
      return config.timeouts.cache;
    };

    Cache.prototype.clear = function() {
      return this._c = {};
    };

    Cache.prototype.lookup = function(k) {
      var obj;
      if ((obj = this._c[k]) == null) {
        obj = this._c[k] = {};
      }
      return obj;
    };

    return Cache;

  })();

  input_trim = function(x) {
    var m, rxx;
    if (x && (x != null)) {
      x = x.replace(/\s+/g, " ");
      rxx = /^(\s*)(.*?)(\s*)$/;
      m = x.match(rxx);
      return m[2];
    } else {
      return "";
    }
  };

  input_clean = function(x) {
    var ret;
    ret = input_trim(x).toLowerCase();
    if (ret.length === 0) {
      ret = null;
    }
    return ret;
  };

  input_clean_preserve_case = function(x) {
    var ret;
    ret = input_trim(x);
    if (ret.length === 0) {
      ret = null;
    }
    return ret;
  };

  VersionObj = (function() {
    function VersionObj(args) {}

    VersionObj.make = function(v, args) {
      switch (v) {
        case 1:
          return new Version1Obj(args);
        case 2:
          return new Version3Obj(args);
        case 3:
          return new Version3Obj(args);
        default:
          return null;
      }
    };

    return VersionObj;

  })();

  Version1Obj = (function(_super) {
    __extends(Version1Obj, _super);

    function Version1Obj(_args) {
      this._args = _args;
    }

    Version1Obj.prototype.clean_passphrase = function(pp) {
      var ret;
      ret = input_trim(pp).replace(/\s+/g, " ");
      if (!ret.length) {
        ret = null;
      }
      return ret;
    };

    Version1Obj.prototype.key_fields = function() {
      return ['email', 'passphrase', 'host', 'generation', 'security_bits'];
    };

    Version1Obj.prototype.key_deriver = function(i) {
      return new derive.V1(i);
    };

    Version1Obj.prototype.version = function() {
      return 1;
    };

    return Version1Obj;

  })(VersionObj);

  Version3Obj = (function(_super) {
    __extends(Version3Obj, _super);

    function Version3Obj(_args) {
      this._args = _args;
    }

    Version3Obj.prototype.clean_passphrase = function(pp) {
      var ret;
      ret = pp.replace(/\s/g, "");
      if (!ret.length) {
        ret = null;
      }
      return ret;
    };

    Version3Obj.prototype.key_fields = function() {
      return ['email', 'passphrase', 'security_bits'];
    };

    Version3Obj.prototype.key_deriver = function(i) {
      return new derive.V3(i);
    };

    Version3Obj.prototype.version = function() {
      return 3;
    };

    return Version3Obj;

  })(VersionObj);

  copy_dict = function(input) {
    var k, ret, v;
    ret = {};
    for (k in input) {
      v = input[k];
      ret[k] = v;
    }
    return ret;
  };

  Input = (function() {
    function Input(_arg) {
      var SELECT, presets,
        _this = this;
      this.engine = _arg.engine, this.keymode = _arg.keymode, this.fixed = _arg.fixed, presets = _arg.presets;
      if (this.keymode == null) {
        this.keymode = derive.keymodes.WEB_PW;
      }
      if (this.fixed == null) {
        this.fixed = {};
      }
      SELECT = [true, true, null];
      this._template = {
        host: [
          true, false, function(x) {
            return input_clean(x);
          }
        ],
        passphrase: [
          true, false, function(x) {
            return _this._clean_passphrase(x);
          }
        ],
        email: [
          true, true, function(x) {
            return input_clean(x);
          }
        ],
        notes: [
          false, true, function(x) {
            return input_clean_preserve_case(x);
          }
        ],
        algo_version: SELECT,
        length: SELECT,
        security_bits: SELECT,
        num_symbols: SELECT,
        generation: SELECT,
        no_timeout: [false, false, null]
      };
      this._defaults = config.input.defaults;
      this._values = presets != null ? copy_dict(presets) : {};
    }

    Input.prototype.fork = function(keymode, fixed) {
      var out;
      out = new Input({
        engine: this.engine,
        keymode: keymode,
        fixed: fixed,
        presets: this._values
      });
      return out;
    };

    Input.prototype.get_version_obj = function() {
      return VersionObj.make(this.get('algo_version'));
    };

    Input.prototype.timeout = function() {
      return config.timeouts.input;
    };

    Input.prototype.clear = function() {};

    Input.prototype.unique_id = function(version_obj) {
      var all, f, fields, parts;
      if (!version_obj) {
        version_obj = this.get_version_obj();
      }
      parts = [version_obj.version(), this.keymode];
      fields = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = version_obj.key_fields();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          f = _ref1[_i];
          _results.push(this.get(f));
        }
        return _results;
      }).call(this);
      all = parts.concat(fields);
      return all.join(";");
    };

    Input.prototype.derive_key = function(cb) {
      var co, compute_hook, res, uid, vo, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      vo = this.get_version_obj();
      uid = this.unique_id(vo);
      compute_hook = function(i, tot) {
        var ret;
        if ((ret = uid === _this.unique_id(vo)) && i % 10 === 0) {
          _this.engine.on_compute_step(_this.keymode, i, tot);
        }
        return ret;
      };
      co = this.engine._cache.lookup(uid);
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Input.derive_key"
        });
        (vo.key_deriver(_this)).run(co, compute_hook, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return res = arguments[0];
            };
          })(),
          lineno: 157
        }));
        __iced_deferrals._fulfill();
      })(function() {
        if (res) {
          _this.engine.on_compute_done(_this.keymode, res);
        }
        return cb(res);
      });
    };

    Input.prototype.get = function(k) {
      var cleaner, f, v, _ref1;
      if ((f = this.fixed[k]) != null) {
        return f;
      } else if ((v = this._values[k]) == null) {
        return this._defaults[k];
      } else if ((cleaner = (_ref1 = this._template[k]) != null ? _ref1[2] : void 0) != null) {
        return cleaner(v);
      } else {
        return v;
      }
    };

    Input.prototype.set = function(k, val) {
      return this._values[k] = val;
    };

    Input.prototype._clean_passphrase = function(pp) {
      return this.get_version_obj().clean_passphrase(pp);
    };

    Input.prototype.is_ready = function() {
      var k, row, v, _ref1;
      _ref1 = this._template;
      for (k in _ref1) {
        row = _ref1[k];
        if (row[0]) {
          if ((v = this.get(k)) == null) {
            return false;
          }
        }
      }
      return true;
    };

    Input.prototype.to_record = function() {
      var d, host, k, row, v, _ref1;
      d = {};
      _ref1 = this._template;
      for (k in _ref1) {
        row = _ref1[k];
        if (!row[1]) {
          continue;
        }
        v = this.get(k);
        if (row[0] && (v == null)) {
          return null;
        }
        d[k] = v;
      }
      if ((host = this.get('host'))) {
        return new Record(host, d);
      } else {
        return null;
      }
    };

    return Input;

  })();

  Timer = (function() {
    function Timer(_obj) {
      this._obj = _obj;
      this._id = null;
    }

    Timer.prototype.force = function() {
      this._obj.clear();
      return this.clear();
    };

    Timer.prototype.set = function() {
      var hook, now,
        _this = this;
      now = util.unix_time();
      hook = function() {
        _this._obj.clear();
        return _this._id = null;
      };
      this.clear();
      return this._id = setTimeout(hook, this._obj.timeout() * 1000);
    };

    Timer.prototype.clear = function() {
      if (this._id != null) {
        clearTimeout(this._id);
        return this._id = null;
      }
    };

    return Timer;

  })();

  Timers = (function() {
    function Timers(_eng) {
      var o;
      this._eng = _eng;
      this._timers = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = [this._eng, this._eng._cache];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          o = _ref1[_i];
          _results.push(new Timer(o));
        }
        return _results;
      }).call(this);
      this._active = false;
    }

    Timers.prototype.poke = function() {
      if (this._active) {
        return this.start();
      }
    };

    Timers.prototype.start = function() {
      var t, _i, _len, _ref1, _results;
      this._active = true;
      _ref1 = this._timers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        t = _ref1[_i];
        _results.push(t.set());
      }
      return _results;
    };

    Timers.prototype.stop = function() {
      var t, _i, _len, _ref1, _results;
      this._active = false;
      _ref1 = this._timers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        t = _ref1[_i];
        _results.push(t.clear());
      }
      return _results;
    };

    Timers.prototype.toggle = function(b) {
      if (b && !this._active) {
        return this.start();
      } else if (!b && this._active) {
        return this.stop();
      }
    };

    Timers.prototype.force = function() {
      var t, _i, _len, _ref1, _results;
      _ref1 = this._timers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        t = _ref1[_i];
        _results.push(t.force());
      }
      return _results;
    };

    return Timers;

  })();

  exports.Engine = Engine = (function() {
    function Engine(opts) {
      var presets, _ref1;
      presets = opts.presets;
      _ref1 = opts.hooks, this.on_compute_step = _ref1.on_compute_step, this.on_compute_done = _ref1.on_compute_done, this.on_timeout = _ref1.on_timeout;
      this._cache = new Cache;
      this._inp = new Input({
        engine: this,
        presets: presets
      });
      this._client = new Client(this, opts.net || {});
      this._timers = new Timers(this);
      if (!this._inp.get('no_timeout')) {
        this._timers.start();
      }
    }

    Engine.prototype.client = function() {
      return this._client;
    };

    Engine.prototype.clear = function() {
      this.client().clear();
      return this.on_timeout();
    };

    Engine.prototype.timeout = function() {
      return config.timeouts.document;
    };

    Engine.prototype.poke = function() {
      return this._timers.poke();
    };

    Engine.prototype.set = function(k, v) {
      if (k === 'no_timeout') {
        this._timers.toggle(!v);
      }
      this._inp.set(k, v);
      return this.maybe_run();
    };

    Engine.prototype.get = function(k) {
      return this._inp.get(k);
    };

    Engine.prototype.run = function() {
      var dk, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        funcname: "Engine.run"
      });
      this._inp.derive_key(__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return dk = arguments[0];
          };
        })(),
        lineno: 298
      }));
      __iced_deferrals._fulfill();
    };

    Engine.prototype.maybe_run = function() {
      if (this._inp.is_ready()) {
        return this.run();
      }
    };

    Engine.prototype.fork_input = function(mode, fixed) {
      return this._inp.fork(mode, fixed);
    };

    Engine.prototype.get_input = function() {
      return this._inp;
    };

    Engine.prototype.is_logged_in = function() {
      return this.client().is_logged_in();
    };

    Engine.prototype.login = function(cb) {
      return this.client().login(cb);
    };

    Engine.prototype.signup = function(cb) {
      return this.client().signup(cb);
    };

    Engine.prototype.push = function(cb) {
      return this.client().push(cb);
    };

    Engine.prototype.remove = function(cb) {
      return this.client().remove(cb);
    };

    Engine.prototype.get_stored_records = function() {
      return this.client().get_stored_records();
    };

    Engine.prototype.get_record = function(h) {
      return this.client().get_record(h);
    };

    Engine.prototype.logout = function(cb) {
      var res, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Engine.logout"
        });
        _this.client().logout(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return res = arguments[0];
            };
          })(),
          lineno: 324
        }));
        __iced_deferrals._fulfill();
      })(function() {
        _this._timers.force();
        return cb(res);
      });
    };

    return Engine;

  })();

}).call(this);


},{"./util.iced":10,"./config.iced":5,"./derive.iced":7,"./client.iced":11,"iced-coffee-script/lib/coffee-script/iced":8}],7:[function(require,module,exports){
(function() {
  var Base, C, V1, V3, config, iced, keymodes, pack_to_word_array, __iced_k, __iced_k_noop,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  iced = require('iced-coffee-script/lib/coffee-script/iced').runtime;
  __iced_k = __iced_k_noop = function() {};

  config = require('./config.iced').config;

  C = require('cryptojs-1sp').CryptoJS;

  pack_to_word_array = require('./pack.iced').pack_to_word_array;

  exports.keymodes = keymodes = {
    WEB_PW: 0x1,
    LOGIN_PW: 0x2,
    RECORD_AES: 0x3,
    RECORD_HMAC: 0x4
  };

  Base = (function() {
    function Base(_input) {
      this._input = _input;
    }

    Base.prototype.is_upper = function(c) {
      return "A".charCodeAt(0) <= c && c <= "Z".charCodeAt(0);
    };

    Base.prototype.is_lower = function(c) {
      return "a".charCodeAt(0) <= c && c <= "z".charCodeAt(0);
    };

    Base.prototype.is_digit = function(c) {
      return "0".charCodeAt(0) <= c && c <= "9".charCodeAt(0);
    };

    Base.prototype.is_valid = function(c) {
      return this.is_upper(c) || this.is_lower(c) || this.is_digit(c);
    };

    Base.prototype.is_ok_pw = function(pw) {
      var bad, c, caps, digits, i, lowers, _i, _j, _ref, _ref1, _ref2;
      caps = 0;
      lowers = 0;
      digits = 0;
      for (i = _i = 0, _ref = config.pw.min_size; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        c = pw.charCodeAt(i);
        if (this.is_digit(c)) {
          digits++;
        } else if (this.is_upper(c)) {
          caps++;
        } else if (this.is_lower(c)) {
          lowers++;
        } else {
          return false;
        }
      }
      bad = function(x) {
        return x === 0 || x > 5;
      };
      if (bad(digits) || bad(lowers) || bad(caps)) {
        return false;
      }
      for (i = _j = _ref1 = config.pw.min_size, _ref2 = config.pw.max_size; _ref1 <= _ref2 ? _j < _ref2 : _j > _ref2; i = _ref1 <= _ref2 ? ++_j : --_j) {
        if (!this.is_valid(pw.charCodeAt(i))) {
          return false;
        }
      }
      return true;
    };

    Base.prototype.find_class_to_sub = function(pw) {
      var c, caps, digits, i, lowers, _i, _ref;
      caps = 0;
      lowers = 0;
      digits = 0;
      for (i = _i = 0, _ref = config.pw.min_size; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        c = pw.charCodeAt(i);
        if (this.is_digit(c)) {
          digits++;
        } else if (this.is_upper(c)) {
          caps++;
        } else if (this.is_lower(c)) {
          lowers++;
        }
      }
      if (lowers >= caps && lowers >= digits) {
        return this.is_lower;
      } else if (digits > lowers && digits >= caps) {
        return this.is_digit;
      } else {
        return this.is_upper;
      }
    };

    Base.prototype.add_syms = function(input, n) {
      var c, fn, i, indices, _i, _ref;
      if (n <= 0) {
        return input;
      }
      fn = this.find_class_to_sub(input);
      indices = [];
      for (i = _i = 0, _ref = config.pw.min_size; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        c = input.charCodeAt(i);
        if (fn.call(this, c)) {
          indices.push(i);
          n--;
          if (n === 0) {
            break;
          }
        }
      }
      return this.add_syms_at_indices(input, indices);
    };

    Base.prototype.add_syms_at_indices = function(input, indices) {
      var _map;
      _map = "`~!@#$%^&*()-_+={}[]|;:,<>.?/";
      return this.translate_at_indices(input, indices, _map);
    };

    Base.prototype.translate_at_indices = function(input, indices, _map) {
      var arr, c, i, index, last, _i, _len;
      last = 0;
      arr = [];
      for (_i = 0, _len = indices.length; _i < _len; _i++) {
        index = indices[_i];
        arr.push(input.slice(last, index));
        c = input.charAt(index);
        i = C.enc.Base64._map.indexOf(c);
        c = _map.charAt(i % _map.length);
        arr.push(c);
        last = index + 1;
      }
      arr.push(input.slice(last));
      return arr.join("");
    };

    Base.prototype.format = function(x) {
      x = this.add_syms(x, this.num_symbols());
      return x.slice(0, this.length());
    };

    Base.prototype.run = function(cache_obj, compute_hook, cb) {
      var cfg, dk, id, ret, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      ret = null;
      cfg = config.derive;
      (function(__iced_k) {
        if (((dk = cache_obj._derived_key) == null) && !cache_obj._running) {
          cache_obj._running = true;
          compute_hook(0, _this._limit);
          id = _this.keymode() === keymodes.WEB_PW ? cfg.initial_delay : cfg.sync_initial_delay;
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "Base.run"
            });
            setTimeout(__iced_deferrals.defer({
              lineno: 137
            }), id);
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              if (compute_hook(0, _this._limit)) {
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    funcname: "Base.run"
                  });
                  _this.run_key_derivation(compute_hook, __iced_deferrals.defer({
                    assign_fn: (function() {
                      return function() {
                        return dk = arguments[0];
                      };
                    })(),
                    lineno: 140
                  }));
                  __iced_deferrals._fulfill();
                })(__iced_k);
              } else {
                return __iced_k();
              }
            })(function() {
              if (dk != null) {
                cache_obj._derived_key = dk;
              }
              return __iced_k(cache_obj._running = false);
            });
          });
        } else {
          return __iced_k();
        }
      })(function() {
        ret = typeof dk === "undefined" || dk === null ? null : _this.is_internal_key() ? dk : _this.format(_this.finalize(dk));
        return cb(ret);
      });
    };

    Base.prototype.delay = function(i, cb) {
      var ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        if ((i + 1) % config.derive.iters_per_slot === 0) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "Base.delay"
            });
            setTimeout(__iced_deferrals.defer({
              lineno: 155
            }), config.derive.internal_delay);
            __iced_deferrals._fulfill();
          })(__iced_k);
        } else {
          return __iced_k();
        }
      })(function() {
        return cb();
      });
    };

    Base.prototype.security_bits = function() {
      return this._input.get('security_bits');
    };

    Base.prototype.email = function() {
      return this._input.get('email');
    };

    Base.prototype.passphrase = function() {
      return this._input.get('passphrase');
    };

    Base.prototype.host = function() {
      return this._input.get('host');
    };

    Base.prototype.generation = function() {
      return this._input.get('generation');
    };

    Base.prototype.num_symbols = function() {
      return this._input.get('num_symbols');
    };

    Base.prototype.keymode = function() {
      return this._input.keymode;
    };

    Base.prototype.length = function() {
      return this._input.get('length');
    };

    return Base;

  })();

  exports.V1 = V1 = (function(_super) {
    __extends(V1, _super);

    function V1(i) {
      V1.__super__.constructor.call(this, i);
      this._limit = 1 << this.security_bits();
    }

    V1.prototype.run_key_derivation = function(compute_hook, cb) {
      var a, b16, b64, d, em, gen, hash, host, i, passphrase, ret, tail, txt, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      ret = null;
      d = 1 << this.security_bits();
      i = 0;
      _ref = [this.email(), this.host(), this.passphrase(), this.generation()], em = _ref[0], host = _ref[1], passphrase = _ref[2], gen = _ref[3];
      (function(__iced_k) {
        var _results, _while;
        _results = [];
        _while = function(__iced_k) {
          var _break, _continue, _next;
          _break = function() {
            return __iced_k(_results);
          };
          _continue = function() {
            return iced.trampoline(function() {
              return _while(__iced_k);
            });
          };
          _next = function(__iced_next_arg) {
            _results.push(__iced_next_arg);
            return _continue();
          };
          if (!!ret) {
            return _break();
          } else {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "V1.run_key_derivation"
              });
              _this.delay(i, __iced_deferrals.defer({
                lineno: 189
              }));
              __iced_deferrals._fulfill();
            })(function() {
              (function(__iced_k) {
                if (compute_hook(i, _this._limit)) {
                  a = ["OneShallPass v1.0", em, host, gen, i];
                  txt = a.join('; ');
                  hash = C.HmacSHA512(txt, passphrase);
                  b16 = hash.toString();
                  b64 = hash.toString(C.enc.Base64);
                  tail = parseInt(b16.slice(b16.length - 8), 16);
                  return __iced_k(tail % d === 0 && _this.is_ok_pw(b64) ? ret = b64 : i++);
                } else {
                  (function(__iced_k) {
_break()
                  })(__iced_k);
                }
              })(_next);
            });
          }
        };
        _while(__iced_k);
      })(function() {
        return cb(ret);
      });
    };

    V1.prototype.is_internal_key = function() {
      return false;
    };

    V1.prototype.finalize = function(dk) {
      return dk;
    };

    return V1;

  })(Base);

  exports.V3 = V3 = (function(_super) {
    __extends(V3, _super);

    function V3(input, _hasher) {
      var exp;
      this._hasher = _hasher;
      V3.__super__.constructor.call(this, input);
      exp = this.security_bits();
      this._limit = 1 << exp;
      if (this._hasher == null) {
        this._hasher = C.algo.SHA512;
      }
    }

    V3.prototype.is_internal_key = function() {
      var _ref;
      return (_ref = this.keymode()) === keymodes.RECORD_AES || _ref === keymodes.RECORD_HMAC;
    };

    V3.prototype.run_key_derivation = function(compute_hook, cb) {
      var block, block_index, hmac, i, intermediate, j, ret, w, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      ret = null;
      hmac = C.algo.HMAC.create(this._hasher, this.passphrase());
      block_index = C.lib.WordArray.create([this.keymode()]);
      block = hmac.update(this.email()).finalize(block_index);
      hmac.reset();
      intermediate = block.clone();
      i = 1;
      (function(__iced_k) {
        var _results, _while;
        _results = [];
        _while = function(__iced_k) {
          var _break, _continue, _next;
          _break = function() {
            return __iced_k(_results);
          };
          _continue = function() {
            return iced.trampoline(function() {
              return _while(__iced_k);
            });
          };
          _next = function(__iced_next_arg) {
            _results.push(__iced_next_arg);
            return _continue();
          };
          if (!(i < _this._limit)) {
            return _break();
          } else {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "V3.run_key_derivation"
              });
              _this.delay(i, __iced_deferrals.defer({
                lineno: 244
              }));
              __iced_deferrals._fulfill();
            })(function() {
              (function(__iced_k) {
                var _i, _len, _ref;
                if (compute_hook(i, _this._limit)) {
                  intermediate = hmac.finalize(intermediate);
                  hmac.reset();
                  _ref = intermediate.words;
                  for (j = _i = 0, _len = _ref.length; _i < _len; j = ++_i) {
                    w = _ref[j];
                    block.words[j] ^= w;
                  }
                  return __iced_k(i++);
                } else {
                  (function(__iced_k) {
_break()
                  })(__iced_k);
                }
              })(_next);
            });
          }
        };
        _while(__iced_k);
      })(function() {
        ret = i !== _this._limit ? null : block;
        return cb(ret);
      });
    };

    V3.prototype.finalize = function(dk) {
      var a, b64, hash, i, ret, wa;
      i = 0;
      ret = null;
      while (!ret) {
        a = ["OneShallPass v2.0", this.email(), this.host(), this.generation(), i];
        wa = pack_to_word_array(a);
        hash = C.HmacSHA512(wa, dk);
        b64 = hash.toString(C.enc.Base64);
        if (this.is_ok_pw(b64)) {
          ret = b64;
        }
        i++;
      }
      return ret;
    };

    V3.prototype.test = function(CryptoJS, password, salt, iterations, cb) {
      var compute_hook, res, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      C = CryptoJS;
      this.email = function() {
        return salt;
      };
      this.passphrase = function() {
        return password;
      };
      this.keymode = function() {
        return 1;
      };
      this._limit = iterations;
      compute_hook = function() {
        return true;
      };
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "V3.test"
        });
        _this.run_key_derivation(compute_hook, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return res = arguments[0];
            };
          })(),
          lineno: 283
        }));
        __iced_deferrals._fulfill();
      })(function() {
        return cb(res);
      });
    };

    return V3;

  })(Base);

}).call(this);


},{"./config.iced":5,"./pack.iced":12,"iced-coffee-script/lib/coffee-script/iced":8,"cryptojs-1sp":13}],10:[function(require,module,exports){
(function() {


  exports.unix_time = function() {
    return Math.floor((new Date).getTime() / 1000);
  };

  exports.is_email = function(e) {
    var x;
    x = /[^\s@]+@[^\s@.]+\.[^\s.@][^\s@]*/;
    return e.match(x);
  };

}).call(this);


},{}],13:[function(require,module,exports){
(function(){/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {
            },

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else if (thatWords.length > 0xffff) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push((Math.random() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512/32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));
(function (undefined) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var X32WordArray = C_lib.WordArray;

    /**
     * x64 namespace.
     */
    var C_x64 = C.x64 = {};

    /**
     * A 64-bit word.
     */
    var X64Word = C_x64.Word = Base.extend({
        /**
         * Initializes a newly created 64-bit word.
         *
         * @param {number} high The high 32 bits.
         * @param {number} low The low 32 bits.
         *
         * @example
         *
         *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
         */
        init: function (high, low) {
            this.high = high;
            this.low = low;
        }

        /**
         * Bitwise NOTs this word.
         *
         * @return {X64Word} A new x64-Word object after negating.
         *
         * @example
         *
         *     var negated = x64Word.not();
         */
        // not: function () {
            // var high = ~this.high;
            // var low = ~this.low;

            // return X64Word.create(high, low);
        // },

        /**
         * Bitwise ANDs this word with the passed word.
         *
         * @param {X64Word} word The x64-Word to AND with this word.
         *
         * @return {X64Word} A new x64-Word object after ANDing.
         *
         * @example
         *
         *     var anded = x64Word.and(anotherX64Word);
         */
        // and: function (word) {
            // var high = this.high & word.high;
            // var low = this.low & word.low;

            // return X64Word.create(high, low);
        // },

        /**
         * Bitwise ORs this word with the passed word.
         *
         * @param {X64Word} word The x64-Word to OR with this word.
         *
         * @return {X64Word} A new x64-Word object after ORing.
         *
         * @example
         *
         *     var ored = x64Word.or(anotherX64Word);
         */
        // or: function (word) {
            // var high = this.high | word.high;
            // var low = this.low | word.low;

            // return X64Word.create(high, low);
        // },

        /**
         * Bitwise XORs this word with the passed word.
         *
         * @param {X64Word} word The x64-Word to XOR with this word.
         *
         * @return {X64Word} A new x64-Word object after XORing.
         *
         * @example
         *
         *     var xored = x64Word.xor(anotherX64Word);
         */
        // xor: function (word) {
            // var high = this.high ^ word.high;
            // var low = this.low ^ word.low;

            // return X64Word.create(high, low);
        // },

        /**
         * Shifts this word n bits to the left.
         *
         * @param {number} n The number of bits to shift.
         *
         * @return {X64Word} A new x64-Word object after shifting.
         *
         * @example
         *
         *     var shifted = x64Word.shiftL(25);
         */
        // shiftL: function (n) {
            // if (n < 32) {
                // var high = (this.high << n) | (this.low >>> (32 - n));
                // var low = this.low << n;
            // } else {
                // var high = this.low << (n - 32);
                // var low = 0;
            // }

            // return X64Word.create(high, low);
        // },

        /**
         * Shifts this word n bits to the right.
         *
         * @param {number} n The number of bits to shift.
         *
         * @return {X64Word} A new x64-Word object after shifting.
         *
         * @example
         *
         *     var shifted = x64Word.shiftR(7);
         */
        // shiftR: function (n) {
            // if (n < 32) {
                // var low = (this.low >>> n) | (this.high << (32 - n));
                // var high = this.high >>> n;
            // } else {
                // var low = this.high >>> (n - 32);
                // var high = 0;
            // }

            // return X64Word.create(high, low);
        // },

        /**
         * Rotates this word n bits to the left.
         *
         * @param {number} n The number of bits to rotate.
         *
         * @return {X64Word} A new x64-Word object after rotating.
         *
         * @example
         *
         *     var rotated = x64Word.rotL(25);
         */
        // rotL: function (n) {
            // return this.shiftL(n).or(this.shiftR(64 - n));
        // },

        /**
         * Rotates this word n bits to the right.
         *
         * @param {number} n The number of bits to rotate.
         *
         * @return {X64Word} A new x64-Word object after rotating.
         *
         * @example
         *
         *     var rotated = x64Word.rotR(7);
         */
        // rotR: function (n) {
            // return this.shiftR(n).or(this.shiftL(64 - n));
        // },

        /**
         * Adds this word with the passed word.
         *
         * @param {X64Word} word The x64-Word to add with this word.
         *
         * @return {X64Word} A new x64-Word object after adding.
         *
         * @example
         *
         *     var added = x64Word.add(anotherX64Word);
         */
        // add: function (word) {
            // var low = (this.low + word.low) | 0;
            // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
            // var high = (this.high + word.high + carry) | 0;

            // return X64Word.create(high, low);
        // }
    });

    /**
     * An array of 64-bit words.
     *
     * @property {Array} words The array of CryptoJS.x64.Word objects.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var X64WordArray = C_x64.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.x64.WordArray.create();
         *
         *     var wordArray = CryptoJS.x64.WordArray.create([
         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
         *     ]);
         *
         *     var wordArray = CryptoJS.x64.WordArray.create([
         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
         *     ], 10);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 8;
            }
        },

        /**
         * Converts this 64-bit word array to a 32-bit word array.
         *
         * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
         *
         * @example
         *
         *     var x32WordArray = x64WordArray.toX32();
         */
        toX32: function () {
            // Shortcuts
            var x64Words = this.words;
            var x64WordsLength = x64Words.length;

            // Convert
            var x32Words = [];
            for (var i = 0; i < x64WordsLength; i++) {
                var x64Word = x64Words[i];
                x32Words.push(x64Word.high);
                x32Words.push(x64Word.low);
            }

            return X32WordArray.create(x32Words, this.sigBytes);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {X64WordArray} The clone.
         *
         * @example
         *
         *     var clone = x64WordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);

            // Clone "words" array
            var words = clone.words = this.words.slice(0);

            // Clone each X64Word object
            var wordsLength = words.length;
            for (var i = 0; i < wordsLength; i++) {
                words[i] = words[i].clone();
            }

            return clone;
        }
    });
}());
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var C_enc = C.enc;

    /**
     * Base64 encoding strategy.
     */
    var Base64 = C_enc.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                }
            }

            // Add padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                while (base64Chars.length % 4) {
                    base64Chars.push(paddingChar);
                }
            }

            return base64Chars.join('');
        },

        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function (base64Str) {
            // Shortcuts
            var base64StrLength = base64Str.length;
            var map = this._map;

            // Ignore padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                if (paddingIndex != -1) {
                    base64StrLength = paddingIndex;
                }
            }

            // Convert
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
                    var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
                    words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }

            return WordArray.create(words, nBytes);
        },

        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var C_algo = C.algo;

    /**
     * HMAC algorithm.
     */
    var HMAC = C_algo.HMAC = Base.extend({
        /**
         * Initializes a newly created HMAC.
         *
         * @param {Hasher} hasher The hash algorithm to use.
         * @param {WordArray|string} key The secret key.
         *
         * @example
         *
         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
         */
        init: function (hasher, key) {
            // Init hasher
            hasher = this._hasher = new hasher.init();

            // Convert string to WordArray, else assume WordArray already
            if (typeof key == 'string') {
                key = Utf8.parse(key);
            }

            // Shortcuts
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;

            // Allow arbitrary length keys
            if (key.sigBytes > hasherBlockSizeBytes) {
                key = hasher.finalize(key);
            }

            // Clamp excess bits
            key.clamp();

            // Clone key for inner and outer pads
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();

            // Shortcuts
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;

            // XOR keys with pad constants
            for (var i = 0; i < hasherBlockSize; i++) {
                oKeyWords[i] ^= 0x5c5c5c5c;
                iKeyWords[i] ^= 0x36363636;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this HMAC to its initial state.
         *
         * @example
         *
         *     hmacHasher.reset();
         */
        reset: function () {
            // Shortcut
            var hasher = this._hasher;

            // Reset
            hasher.reset();
            hasher.update(this._iKey);
        },

        /**
         * Updates this HMAC with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {HMAC} This HMAC instance.
         *
         * @example
         *
         *     hmacHasher.update('message');
         *     hmacHasher.update(wordArray);
         */
        update: function (messageUpdate) {
            this._hasher.update(messageUpdate);

            // Chainable
            return this;
        },

        /**
         * Finalizes the HMAC computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The HMAC.
         *
         * @example
         *
         *     var hmac = hmacHasher.finalize();
         *     var hmac = hmacHasher.finalize('message');
         *     var hmac = hmacHasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Shortcut
            var hasher = this._hasher;

            // Compute HMAC
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

            return hmac;
        }
    });
}());
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Reusable object
    var W = [];

    /**
     * SHA-1 hash algorithm.
     */
    var SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init([
                0x67452301, 0xefcdab89,
                0x98badcfe, 0x10325476,
                0xc3d2e1f0
            ]);
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];

            // Computation
            for (var i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = (n << 1) | (n >>> 31);
                }

                var t = ((a << 5) | (a >>> 27)) + e + W[i];
                if (i < 20) {
                    t += ((b & c) | (~b & d)) + 0x5a827999;
                } else if (i < 40) {
                    t += (b ^ c ^ d) + 0x6ed9eba1;
                } else if (i < 60) {
                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
                } else /* if (i < 80) */ {
                    t += (b ^ c ^ d) - 0x359d3e2a;
                }

                e = d;
                d = c;
                c = (b << 30) | (b >>> 2);
                b = a;
                a = t;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA1('message');
     *     var hash = CryptoJS.SHA1(wordArray);
     */
    C.SHA1 = Hasher._createHelper(SHA1);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA1(message, key);
     */
    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
}());
(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA256('message');
     *     var hash = CryptoJS.SHA256(wordArray);
     */
    C.SHA256 = Hasher._createHelper(SHA256);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA256(message, key);
     */
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Hasher = C_lib.Hasher;
    var C_x64 = C.x64;
    var X64Word = C_x64.Word;
    var X64WordArray = C_x64.WordArray;
    var C_algo = C.algo;

    function X64Word_create() {
        return X64Word.create.apply(X64Word, arguments);
    }

    // Constants
    var K = [
        X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
        X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
        X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
        X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
        X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
        X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
        X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
        X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
        X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
        X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
        X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
        X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
        X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
        X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
        X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
        X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
        X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
        X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
        X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
        X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
        X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
        X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
        X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
        X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
        X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
        X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
        X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
        X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
        X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
        X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
        X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
        X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
        X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
        X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
        X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
        X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
        X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
        X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
        X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
        X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
    ];

    // Reusable objects
    var W = [];
    (function () {
        for (var i = 0; i < 80; i++) {
            W[i] = X64Word_create();
        }
    }());

    /**
     * SHA-512 hash algorithm.
     */
    var SHA512 = C_algo.SHA512 = Hasher.extend({
        _doReset: function () {
            this._hash = new X64WordArray.init([
                new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
                new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
                new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
                new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
            ]);
        },

        _doProcessBlock: function (M, offset) {
            // Shortcuts
            var H = this._hash.words;

            var H0 = H[0];
            var H1 = H[1];
            var H2 = H[2];
            var H3 = H[3];
            var H4 = H[4];
            var H5 = H[5];
            var H6 = H[6];
            var H7 = H[7];

            var H0h = H0.high;
            var H0l = H0.low;
            var H1h = H1.high;
            var H1l = H1.low;
            var H2h = H2.high;
            var H2l = H2.low;
            var H3h = H3.high;
            var H3l = H3.low;
            var H4h = H4.high;
            var H4l = H4.low;
            var H5h = H5.high;
            var H5l = H5.low;
            var H6h = H6.high;
            var H6l = H6.low;
            var H7h = H7.high;
            var H7l = H7.low;

            // Working variables
            var ah = H0h;
            var al = H0l;
            var bh = H1h;
            var bl = H1l;
            var ch = H2h;
            var cl = H2l;
            var dh = H3h;
            var dl = H3l;
            var eh = H4h;
            var el = H4l;
            var fh = H5h;
            var fl = H5l;
            var gh = H6h;
            var gl = H6l;
            var hh = H7h;
            var hl = H7l;

            // Rounds
            for (var i = 0; i < 80; i++) {
                // Shortcut
                var Wi = W[i];

                // Extend message
                if (i < 16) {
                    var Wih = Wi.high = M[offset + i * 2]     | 0;
                    var Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
                } else {
                    // Gamma0
                    var gamma0x  = W[i - 15];
                    var gamma0xh = gamma0x.high;
                    var gamma0xl = gamma0x.low;
                    var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
                    var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

                    // Gamma1
                    var gamma1x  = W[i - 2];
                    var gamma1xh = gamma1x.high;
                    var gamma1xl = gamma1x.low;
                    var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
                    var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

                    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
                    var Wi7  = W[i - 7];
                    var Wi7h = Wi7.high;
                    var Wi7l = Wi7.low;

                    var Wi16  = W[i - 16];
                    var Wi16h = Wi16.high;
                    var Wi16l = Wi16.low;

                    var Wil = gamma0l + Wi7l;
                    var Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
                    var Wil = Wil + gamma1l;
                    var Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
                    var Wil = Wil + Wi16l;
                    var Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

                    Wi.high = Wih;
                    Wi.low  = Wil;
                }

                var chh  = (eh & fh) ^ (~eh & gh);
                var chl  = (el & fl) ^ (~el & gl);
                var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
                var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

                var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
                var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
                var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
                var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

                // t1 = h + sigma1 + ch + K[i] + W[i]
                var Ki  = K[i];
                var Kih = Ki.high;
                var Kil = Ki.low;

                var t1l = hl + sigma1l;
                var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
                var t1l = t1l + chl;
                var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
                var t1l = t1l + Kil;
                var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
                var t1l = t1l + Wil;
                var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

                // t2 = sigma0 + maj
                var t2l = sigma0l + majl;
                var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

                // Update working variables
                hh = gh;
                hl = gl;
                gh = fh;
                gl = fl;
                fh = eh;
                fl = el;
                el = (dl + t1l) | 0;
                eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
                dh = ch;
                dl = cl;
                ch = bh;
                cl = bl;
                bh = ah;
                bl = al;
                al = (t1l + t2l) | 0;
                ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
            }

            // Intermediate hash value
            H0l = H0.low  = (H0l + al);
            H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
            H1l = H1.low  = (H1l + bl);
            H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
            H2l = H2.low  = (H2l + cl);
            H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
            H3l = H3.low  = (H3l + dl);
            H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
            H4l = H4.low  = (H4l + el);
            H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
            H5l = H5.low  = (H5l + fl);
            H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
            H6l = H6.low  = (H6l + gl);
            H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
            H7l = H7.low  = (H7l + hl);
            H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Convert hash to 32-bit word array before returning
            var hash = this._hash.toX32();

            // Return final computed hash
            return hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        },

        blockSize: 1024/32
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA512('message');
     *     var hash = CryptoJS.SHA512(wordArray);
     */
    C.SHA512 = Hasher._createHelper(SHA512);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA512(message, key);
     */
    C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
}());
(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Constants table
    var T = [];

    // Compute constants
    (function () {
        for (var i = 0; i < 64; i++) {
            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
        }
    }());

    /**
     * MD5 hash algorithm.
     */
    var MD5 = C_algo.MD5 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init([
                0x67452301, 0xefcdab89,
                0x98badcfe, 0x10325476
            ]);
        },

        _doProcessBlock: function (M, offset) {
            // Swap endian
            for (var i = 0; i < 16; i++) {
                // Shortcuts
                var offset_i = offset + i;
                var M_offset_i = M[offset_i];

                M[offset_i] = (
                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
                );
            }

            // Shortcuts
            var H = this._hash.words;

            var M_offset_0  = M[offset + 0];
            var M_offset_1  = M[offset + 1];
            var M_offset_2  = M[offset + 2];
            var M_offset_3  = M[offset + 3];
            var M_offset_4  = M[offset + 4];
            var M_offset_5  = M[offset + 5];
            var M_offset_6  = M[offset + 6];
            var M_offset_7  = M[offset + 7];
            var M_offset_8  = M[offset + 8];
            var M_offset_9  = M[offset + 9];
            var M_offset_10 = M[offset + 10];
            var M_offset_11 = M[offset + 11];
            var M_offset_12 = M[offset + 12];
            var M_offset_13 = M[offset + 13];
            var M_offset_14 = M[offset + 14];
            var M_offset_15 = M[offset + 15];

            // Working varialbes
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];

            // Computation
            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
            d = II(d, a, b, c, M_offset_7,  10, T[49]);
            c = II(c, d, a, b, M_offset_14, 15, T[50]);
            b = II(b, c, d, a, M_offset_5,  21, T[51]);
            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
            d = II(d, a, b, c, M_offset_3,  10, T[53]);
            c = II(c, d, a, b, M_offset_10, 15, T[54]);
            b = II(b, c, d, a, M_offset_1,  21, T[55]);
            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
            d = II(d, a, b, c, M_offset_15, 10, T[57]);
            c = II(c, d, a, b, M_offset_6,  15, T[58]);
            b = II(b, c, d, a, M_offset_13, 21, T[59]);
            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
            d = II(d, a, b, c, M_offset_11, 10, T[61]);
            c = II(c, d, a, b, M_offset_2,  15, T[62]);
            b = II(b, c, d, a, M_offset_9,  21, T[63]);

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
            var nBitsTotalL = nBitsTotal;
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
            );
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
            );

            data.sigBytes = (dataWords.length + 1) * 4;

            // Hash final blocks
            this._process();

            // Shortcuts
            var hash = this._hash;
            var H = hash.words;

            // Swap endian
            for (var i = 0; i < 4; i++) {
                // Shortcut
                var H_i = H[i];

                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
            }

            // Return final computed hash
            return hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    function FF(a, b, c, d, x, s, t) {
        var n = a + ((b & c) | (~b & d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function GG(a, b, c, d, x, s, t) {
        var n = a + ((b & d) | (c & ~d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function HH(a, b, c, d, x, s, t) {
        var n = a + (b ^ c ^ d) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function II(a, b, c, d, x, s, t) {
        var n = a + (c ^ (b | ~d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.MD5('message');
     *     var hash = CryptoJS.MD5(wordArray);
     */
    C.MD5 = Hasher._createHelper(MD5);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacMD5(message, key);
     */
    C.HmacMD5 = Hasher._createHmacHelper(MD5);
}(Math));
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    var C_algo = C.algo;
    var MD5 = C_algo.MD5;

    /**
     * This key derivation function is meant to conform with EVP_BytesToKey.
     * www.openssl.org/docs/crypto/EVP_BytesToKey.html
     */
    var EvpKDF = C_algo.EvpKDF = Base.extend({
        /**
         * Configuration options.
         *
         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
         * @property {Hasher} hasher The hash algorithm to use. Default: MD5
         * @property {number} iterations The number of iterations to perform. Default: 1
         */
        cfg: Base.extend({
            keySize: 128/32,
            hasher: MD5,
            iterations: 1
        }),

        /**
         * Initializes a newly created key derivation function.
         *
         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
         *
         * @example
         *
         *     var kdf = CryptoJS.algo.EvpKDF.create();
         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
         */
        init: function (cfg) {
            this.cfg = this.cfg.extend(cfg);
        },

        /**
         * Derives a key from a password.
         *
         * @param {WordArray|string} password The password.
         * @param {WordArray|string} salt A salt.
         *
         * @return {WordArray} The derived key.
         *
         * @example
         *
         *     var key = kdf.compute(password, salt);
         */
        compute: function (password, salt) {
            // Shortcut
            var cfg = this.cfg;

            // Init hasher
            var hasher = cfg.hasher.create();

            // Initial values
            var derivedKey = WordArray.create();

            // Shortcuts
            var derivedKeyWords = derivedKey.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;

            // Generate key
            while (derivedKeyWords.length < keySize) {
                if (block) {
                    hasher.update(block);
                }
                var block = hasher.update(password).finalize(salt);
                hasher.reset();

                // Iterations
                for (var i = 1; i < iterations; i++) {
                    block = hasher.finalize(block);
                    hasher.reset();
                }

                derivedKey.concat(block);
            }
            derivedKey.sigBytes = keySize * 4;

            return derivedKey;
        }
    });

    /**
     * Derives a key from a password.
     *
     * @param {WordArray|string} password The password.
     * @param {WordArray|string} salt A salt.
     * @param {Object} cfg (Optional) The configuration options to use for this computation.
     *
     * @return {WordArray} The derived key.
     *
     * @static
     *
     * @example
     *
     *     var key = CryptoJS.EvpKDF(password, salt);
     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
     */
    C.EvpKDF = function (password, salt, cfg) {
        return EvpKDF.create(cfg).compute(password, salt);
    };
}());
/**
 * Cipher core components.
 */
CryptoJS.lib.Cipher || (function (undefined) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var Base64 = C_enc.Base64;
    var C_algo = C.algo;
    var EvpKDF = C_algo.EvpKDF;

    /**
     * Abstract base cipher template.
     *
     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
     */
    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         *
         * @property {WordArray} iv The IV to use for this operation.
         */
        cfg: Base.extend(),

        /**
         * Creates this cipher in encryption mode.
         *
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {Cipher} A cipher instance.
         *
         * @static
         *
         * @example
         *
         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
         */
        createEncryptor: function (key, cfg) {
            return this.create(this._ENC_XFORM_MODE, key, cfg);
        },

        /**
         * Creates this cipher in decryption mode.
         *
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {Cipher} A cipher instance.
         *
         * @static
         *
         * @example
         *
         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
         */
        createDecryptor: function (key, cfg) {
            return this.create(this._DEC_XFORM_MODE, key, cfg);
        },

        /**
         * Initializes a newly created cipher.
         *
         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @example
         *
         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
         */
        init: function (xformMode, key, cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Store transform mode and key
            this._xformMode = xformMode;
            this._key = key;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this cipher to its initial state.
         *
         * @example
         *
         *     cipher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-cipher logic
            this._doReset();
        },

        /**
         * Adds data to be encrypted or decrypted.
         *
         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
         *
         * @return {WordArray} The data after processing.
         *
         * @example
         *
         *     var encrypted = cipher.process('data');
         *     var encrypted = cipher.process(wordArray);
         */
        process: function (dataUpdate) {
            // Append
            this._append(dataUpdate);

            // Process available blocks
            return this._process();
        },

        /**
         * Finalizes the encryption or decryption process.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
         *
         * @return {WordArray} The data after final processing.
         *
         * @example
         *
         *     var encrypted = cipher.finalize();
         *     var encrypted = cipher.finalize('data');
         *     var encrypted = cipher.finalize(wordArray);
         */
        finalize: function (dataUpdate) {
            // Final data update
            if (dataUpdate) {
                this._append(dataUpdate);
            }

            // Perform concrete-cipher logic
            var finalProcessedData = this._doFinalize();

            return finalProcessedData;
        },

        keySize: 128/32,

        ivSize: 128/32,

        _ENC_XFORM_MODE: 1,

        _DEC_XFORM_MODE: 2,

        /**
         * Creates shortcut functions to a cipher's object interface.
         *
         * @param {Cipher} cipher The cipher to create a helper for.
         *
         * @return {Object} An object with encrypt and decrypt shortcut functions.
         *
         * @static
         *
         * @example
         *
         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
         */
        _createHelper: (function () {
            function selectCipherStrategy(key) {
                if (typeof key == 'string') {
                    return PasswordBasedCipher;
                } else {
                    return SerializableCipher;
                }
            }

            return function (cipher) {
                return {
                    encrypt: function (message, key, cfg) {
                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
                    },

                    decrypt: function (ciphertext, key, cfg) {
                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
                    }
                };
            };
        }())
    });

    /**
     * Abstract base stream cipher template.
     *
     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
     */
    var StreamCipher = C_lib.StreamCipher = Cipher.extend({
        _doFinalize: function () {
            // Process partial blocks
            var finalProcessedBlocks = this._process(!!'flush');

            return finalProcessedBlocks;
        },

        blockSize: 1
    });

    /**
     * Mode namespace.
     */
    var C_mode = C.mode = {};

    /**
     * Abstract base block cipher mode template.
     */
    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
        /**
         * Creates this mode for encryption.
         *
         * @param {Cipher} cipher A block cipher instance.
         * @param {Array} iv The IV words.
         *
         * @static
         *
         * @example
         *
         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
         */
        createEncryptor: function (cipher, iv) {
            return this.Encryptor.create(cipher, iv);
        },

        /**
         * Creates this mode for decryption.
         *
         * @param {Cipher} cipher A block cipher instance.
         * @param {Array} iv The IV words.
         *
         * @static
         *
         * @example
         *
         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
         */
        createDecryptor: function (cipher, iv) {
            return this.Decryptor.create(cipher, iv);
        },

        /**
         * Initializes a newly created mode.
         *
         * @param {Cipher} cipher A block cipher instance.
         * @param {Array} iv The IV words.
         *
         * @example
         *
         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
         */
        init: function (cipher, iv) {
            this._cipher = cipher;
            this._iv = iv;
        }
    });

    /**
     * Cipher Block Chaining mode.
     */
    var CBC = C_mode.CBC = (function () {
        /**
         * Abstract base CBC mode.
         */
        var CBC = BlockCipherMode.extend();

        /**
         * CBC encryptor.
         */
        CBC.Encryptor = CBC.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher;
                var blockSize = cipher.blockSize;

                // XOR and encrypt
                xorBlock.call(this, words, offset, blockSize);
                cipher.encryptBlock(words, offset);

                // Remember this block to use with next block
                this._prevBlock = words.slice(offset, offset + blockSize);
            }
        });

        /**
         * CBC decryptor.
         */
        CBC.Decryptor = CBC.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher;
                var blockSize = cipher.blockSize;

                // Remember this block to use with next block
                var thisBlock = words.slice(offset, offset + blockSize);

                // Decrypt and XOR
                cipher.decryptBlock(words, offset);
                xorBlock.call(this, words, offset, blockSize);

                // This block becomes the previous block
                this._prevBlock = thisBlock;
            }
        });

        function xorBlock(words, offset, blockSize) {
            // Shortcut
            var iv = this._iv;

            // Choose mixing block
            if (iv) {
                var block = iv;

                // Remove IV for subsequent blocks
                this._iv = undefined;
            } else {
                var block = this._prevBlock;
            }

            // XOR blocks
            for (var i = 0; i < blockSize; i++) {
                words[offset + i] ^= block[i];
            }
        }

        return CBC;
    }());

    /**
     * Padding namespace.
     */
    var C_pad = C.pad = {};

    /**
     * PKCS #5/7 padding strategy.
     */
    var Pkcs7 = C_pad.Pkcs7 = {
        /**
         * Pads data using the algorithm defined in PKCS #5/7.
         *
         * @param {WordArray} data The data to pad.
         * @param {number} blockSize The multiple that the data should be padded to.
         *
         * @static
         *
         * @example
         *
         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
         */
        pad: function (data, blockSize) {
            // Shortcut
            var blockSizeBytes = blockSize * 4;

            // Count padding bytes
            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

            // Create padding word
            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

            // Create padding
            var paddingWords = [];
            for (var i = 0; i < nPaddingBytes; i += 4) {
                paddingWords.push(paddingWord);
            }
            var padding = WordArray.create(paddingWords, nPaddingBytes);

            // Add padding
            data.concat(padding);
        },

        /**
         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
         *
         * @param {WordArray} data The data to unpad.
         *
         * @static
         *
         * @example
         *
         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
         */
        unpad: function (data) {
            // Get number of padding bytes from last byte
            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

            // Remove padding
            data.sigBytes -= nPaddingBytes;
        }
    };

    /**
     * Abstract base block cipher template.
     *
     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
     */
    var BlockCipher = C_lib.BlockCipher = Cipher.extend({
        /**
         * Configuration options.
         *
         * @property {Mode} mode The block mode to use. Default: CBC
         * @property {Padding} padding The padding strategy to use. Default: Pkcs7
         */
        cfg: Cipher.cfg.extend({
            mode: CBC,
            padding: Pkcs7
        }),

        reset: function () {
            // Reset cipher
            Cipher.reset.call(this);

            // Shortcuts
            var cfg = this.cfg;
            var iv = cfg.iv;
            var mode = cfg.mode;

            // Reset block mode
            if (this._xformMode == this._ENC_XFORM_MODE) {
                var modeCreator = mode.createEncryptor;
            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
                var modeCreator = mode.createDecryptor;

                // Keep at least one block in the buffer for unpadding
                this._minBufferSize = 1;
            }
            this._mode = modeCreator.call(mode, this, iv && iv.words);
        },

        _doProcessBlock: function (words, offset) {
            this._mode.processBlock(words, offset);
        },

        _doFinalize: function () {
            // Shortcut
            var padding = this.cfg.padding;

            // Finalize
            if (this._xformMode == this._ENC_XFORM_MODE) {
                // Pad data
                padding.pad(this._data, this.blockSize);

                // Process final blocks
                var finalProcessedBlocks = this._process(!!'flush');
            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
                // Process final blocks
                var finalProcessedBlocks = this._process(!!'flush');

                // Unpad data
                padding.unpad(finalProcessedBlocks);
            }

            return finalProcessedBlocks;
        },

        blockSize: 128/32
    });

    /**
     * A collection of cipher parameters.
     *
     * @property {WordArray} ciphertext The raw ciphertext.
     * @property {WordArray} key The key to this ciphertext.
     * @property {WordArray} iv The IV used in the ciphering operation.
     * @property {WordArray} salt The salt used with a key derivation function.
     * @property {Cipher} algorithm The cipher algorithm.
     * @property {Mode} mode The block mode used in the ciphering operation.
     * @property {Padding} padding The padding scheme used in the ciphering operation.
     * @property {number} blockSize The block size of the cipher.
     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
     */
    var CipherParams = C_lib.CipherParams = Base.extend({
        /**
         * Initializes a newly created cipher params object.
         *
         * @param {Object} cipherParams An object with any of the possible cipher parameters.
         *
         * @example
         *
         *     var cipherParams = CryptoJS.lib.CipherParams.create({
         *         ciphertext: ciphertextWordArray,
         *         key: keyWordArray,
         *         iv: ivWordArray,
         *         salt: saltWordArray,
         *         algorithm: CryptoJS.algo.AES,
         *         mode: CryptoJS.mode.CBC,
         *         padding: CryptoJS.pad.PKCS7,
         *         blockSize: 4,
         *         formatter: CryptoJS.format.OpenSSL
         *     });
         */
        init: function (cipherParams) {
            this.mixIn(cipherParams);
        },

        /**
         * Converts this cipher params object to a string.
         *
         * @param {Format} formatter (Optional) The formatting strategy to use.
         *
         * @return {string} The stringified cipher params.
         *
         * @throws Error If neither the formatter nor the default formatter is set.
         *
         * @example
         *
         *     var string = cipherParams + '';
         *     var string = cipherParams.toString();
         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
         */
        toString: function (formatter) {
            return (formatter || this.formatter).stringify(this);
        }
    });

    /**
     * Format namespace.
     */
    var C_format = C.format = {};

    /**
     * OpenSSL formatting strategy.
     */
    var OpenSSLFormatter = C_format.OpenSSL = {
        /**
         * Converts a cipher params object to an OpenSSL-compatible string.
         *
         * @param {CipherParams} cipherParams The cipher params object.
         *
         * @return {string} The OpenSSL-compatible string.
         *
         * @static
         *
         * @example
         *
         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
         */
        stringify: function (cipherParams) {
            // Shortcuts
            var ciphertext = cipherParams.ciphertext;
            var salt = cipherParams.salt;

            // Format
            if (salt) {
                var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
            } else {
                var wordArray = ciphertext;
            }

            return wordArray.toString(Base64);
        },

        /**
         * Converts an OpenSSL-compatible string to a cipher params object.
         *
         * @param {string} openSSLStr The OpenSSL-compatible string.
         *
         * @return {CipherParams} The cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
         */
        parse: function (openSSLStr) {
            // Parse base64
            var ciphertext = Base64.parse(openSSLStr);

            // Shortcut
            var ciphertextWords = ciphertext.words;

            // Test for salt
            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
                // Extract salt
                var salt = WordArray.create(ciphertextWords.slice(2, 4));

                // Remove salt from ciphertext
                ciphertextWords.splice(0, 4);
                ciphertext.sigBytes -= 16;
            }

            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
        }
    };

    /**
     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
     */
    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
        /**
         * Configuration options.
         *
         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
         */
        cfg: Base.extend({
            format: OpenSSLFormatter
        }),

        /**
         * Encrypts a message.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {WordArray|string} message The message to encrypt.
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {CipherParams} A cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
         */
        encrypt: function (cipher, message, key, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Encrypt
            var encryptor = cipher.createEncryptor(key, cfg);
            var ciphertext = encryptor.finalize(message);

            // Shortcut
            var cipherCfg = encryptor.cfg;

            // Create and return serializable cipher params
            return CipherParams.create({
                ciphertext: ciphertext,
                key: key,
                iv: cipherCfg.iv,
                algorithm: cipher,
                mode: cipherCfg.mode,
                padding: cipherCfg.padding,
                blockSize: cipher.blockSize,
                formatter: cfg.format
            });
        },

        /**
         * Decrypts serialized ciphertext.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {WordArray} The plaintext.
         *
         * @static
         *
         * @example
         *
         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
         */
        decrypt: function (cipher, ciphertext, key, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Convert string to CipherParams
            ciphertext = this._parse(ciphertext, cfg.format);

            // Decrypt
            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

            return plaintext;
        },

        /**
         * Converts serialized ciphertext to CipherParams,
         * else assumed CipherParams already and returns ciphertext unchanged.
         *
         * @param {CipherParams|string} ciphertext The ciphertext.
         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
         *
         * @return {CipherParams} The unserialized ciphertext.
         *
         * @static
         *
         * @example
         *
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
         */
        _parse: function (ciphertext, format) {
            if (typeof ciphertext == 'string') {
                return format.parse(ciphertext, this);
            } else {
                return ciphertext;
            }
        }
    });

    /**
     * Key derivation function namespace.
     */
    var C_kdf = C.kdf = {};

    /**
     * OpenSSL key derivation function.
     */
    var OpenSSLKdf = C_kdf.OpenSSL = {
        /**
         * Derives a key and IV from a password.
         *
         * @param {string} password The password to derive from.
         * @param {number} keySize The size in words of the key to generate.
         * @param {number} ivSize The size in words of the IV to generate.
         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
         *
         * @return {CipherParams} A cipher params object with the key, IV, and salt.
         *
         * @static
         *
         * @example
         *
         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
         */
        execute: function (password, keySize, ivSize, salt) {
            // Generate random salt
            if (!salt) {
                salt = WordArray.random(64/8);
            }

            // Derive key and IV
            var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

            // Separate key and IV
            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
            key.sigBytes = keySize * 4;

            // Return params
            return CipherParams.create({ key: key, iv: iv, salt: salt });
        }
    };

    /**
     * A serializable cipher wrapper that derives the key from a password,
     * and returns ciphertext as a serializable cipher params object.
     */
    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
        /**
         * Configuration options.
         *
         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
         */
        cfg: SerializableCipher.cfg.extend({
            kdf: OpenSSLKdf
        }),

        /**
         * Encrypts a message using a password.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {WordArray|string} message The message to encrypt.
         * @param {string} password The password.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {CipherParams} A cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
         */
        encrypt: function (cipher, message, password, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Derive key and other params
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);

            // Add IV to config
            cfg.iv = derivedParams.iv;

            // Encrypt
            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

            // Mix in derived params
            ciphertext.mixIn(derivedParams);

            return ciphertext;
        },

        /**
         * Decrypts serialized ciphertext using a password.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
         * @param {string} password The password.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {WordArray} The plaintext.
         *
         * @static
         *
         * @example
         *
         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
         */
        decrypt: function (cipher, ciphertext, password, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Convert string to CipherParams
            ciphertext = this._parse(ciphertext, cfg.format);

            // Derive key and other params
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);

            // Add IV to config
            cfg.iv = derivedParams.iv;

            // Decrypt
            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

            return plaintext;
        }
    });
}());
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var BlockCipher = C_lib.BlockCipher;
    var C_algo = C.algo;

    // Lookup tables
    var SBOX = [];
    var INV_SBOX = [];
    var SUB_MIX_0 = [];
    var SUB_MIX_1 = [];
    var SUB_MIX_2 = [];
    var SUB_MIX_3 = [];
    var INV_SUB_MIX_0 = [];
    var INV_SUB_MIX_1 = [];
    var INV_SUB_MIX_2 = [];
    var INV_SUB_MIX_3 = [];

    // Compute lookup tables
    (function () {
        // Compute double table
        var d = [];
        for (var i = 0; i < 256; i++) {
            if (i < 128) {
                d[i] = i << 1;
            } else {
                d[i] = (i << 1) ^ 0x11b;
            }
        }

        // Walk GF(2^8)
        var x = 0;
        var xi = 0;
        for (var i = 0; i < 256; i++) {
            // Compute sbox
            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
            SBOX[x] = sx;
            INV_SBOX[sx] = x;

            // Compute multiplication
            var x2 = d[x];
            var x4 = d[x2];
            var x8 = d[x4];

            // Compute sub bytes, mix columns tables
            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
            SUB_MIX_3[x] = t;

            // Compute inv sub bytes, inv mix columns tables
            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
            INV_SUB_MIX_3[sx] = t;

            // Compute next counter
            if (!x) {
                x = xi = 1;
            } else {
                x = x2 ^ d[d[d[x8 ^ x2]]];
                xi ^= d[d[xi]];
            }
        }
    }());

    // Precomputed Rcon lookup
    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

    /**
     * AES block cipher algorithm.
     */
    var AES = C_algo.AES = BlockCipher.extend({
        _doReset: function () {
            // Shortcuts
            var key = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;

            // Compute number of rounds
            var nRounds = this._nRounds = keySize + 6

            // Compute number of key schedule rows
            var ksRows = (nRounds + 1) * 4;

            // Compute key schedule
            var keySchedule = this._keySchedule = [];
            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
                if (ksRow < keySize) {
                    keySchedule[ksRow] = keyWords[ksRow];
                } else {
                    var t = keySchedule[ksRow - 1];

                    if (!(ksRow % keySize)) {
                        // Rot word
                        t = (t << 8) | (t >>> 24);

                        // Sub word
                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

                        // Mix Rcon
                        t ^= RCON[(ksRow / keySize) | 0] << 24;
                    } else if (keySize > 6 && ksRow % keySize == 4) {
                        // Sub word
                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
                    }

                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
                }
            }

            // Compute inv key schedule
            var invKeySchedule = this._invKeySchedule = [];
            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
                var ksRow = ksRows - invKsRow;

                if (invKsRow % 4) {
                    var t = keySchedule[ksRow];
                } else {
                    var t = keySchedule[ksRow - 4];
                }

                if (invKsRow < 4 || ksRow <= 4) {
                    invKeySchedule[invKsRow] = t;
                } else {
                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
                }
            }
        },

        encryptBlock: function (M, offset) {
            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
        },

        decryptBlock: function (M, offset) {
            // Swap 2nd and 4th rows
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;

            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

            // Inv swap 2nd and 4th rows
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
        },

        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
            // Shortcut
            var nRounds = this._nRounds;

            // Get input, add round key
            var s0 = M[offset]     ^ keySchedule[0];
            var s1 = M[offset + 1] ^ keySchedule[1];
            var s2 = M[offset + 2] ^ keySchedule[2];
            var s3 = M[offset + 3] ^ keySchedule[3];

            // Key schedule row counter
            var ksRow = 4;

            // Rounds
            for (var round = 1; round < nRounds; round++) {
                // Shift rows, sub bytes, mix columns, add round key
                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

                // Update state
                s0 = t0;
                s1 = t1;
                s2 = t2;
                s3 = t3;
            }

            // Shift rows, sub bytes, add round key
            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

            // Set output
            M[offset]     = t0;
            M[offset + 1] = t1;
            M[offset + 2] = t2;
            M[offset + 3] = t3;
        },

        keySize: 256/32
    });

    /**
     * Shortcut functions to the cipher's object interface.
     *
     * @example
     *
     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
     */
    C.AES = BlockCipher._createHelper(AES);
}());
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    var C_algo = C.algo;
    var SHA1 = C_algo.SHA1;
    var HMAC = C_algo.HMAC;

    /**
     * Password-Based Key Derivation Function 2 algorithm.
     */
    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
        /**
         * Configuration options.
         *
         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
         * @property {Hasher} hasher The hasher to use. Default: SHA1
         * @property {number} iterations The number of iterations to perform. Default: 1
         */
        cfg: Base.extend({
            keySize: 128/32,
            hasher: SHA1,
            iterations: 1
        }),

        /**
         * Initializes a newly created key derivation function.
         *
         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
         *
         * @example
         *
         *     var kdf = CryptoJS.algo.PBKDF2.create();
         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
         */
        init: function (cfg) {
            this.cfg = this.cfg.extend(cfg);
        },

        /**
         * Computes the Password-Based Key Derivation Function 2.
         *
         * @param {WordArray|string} password The password.
         * @param {WordArray|string} salt A salt.
         *
         * @return {WordArray} The derived key.
         *
         * @example
         *
         *     var key = kdf.compute(password, salt);
         */
        compute: function (password, salt) {
            // Shortcut
            var cfg = this.cfg;

            // Init HMAC
            var hmac = HMAC.create(cfg.hasher, password);

            // Initial values
            var derivedKey = WordArray.create();
            var blockIndex = WordArray.create([0x00000001]);

            // Shortcuts
            var derivedKeyWords = derivedKey.words;
            var blockIndexWords = blockIndex.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;

            // Generate key
            while (derivedKeyWords.length < keySize) {
                var block = hmac.update(salt).finalize(blockIndex);
                hmac.reset();

                // Shortcuts
                var blockWords = block.words;
                var blockWordsLength = blockWords.length;

                // Iterations
                var intermediate = block;
                for (var i = 1; i < iterations; i++) {
                    intermediate = hmac.finalize(intermediate);
                    hmac.reset();

                    // Shortcut
                    var intermediateWords = intermediate.words;

                    // XOR intermediate with block
                    for (var j = 0; j < blockWordsLength; j++) {
                        blockWords[j] ^= intermediateWords[j];
                    }
                }

                derivedKey.concat(block);
                blockIndexWords[0]++;
            }
            derivedKey.sigBytes = keySize * 4;

            return derivedKey;
        }
    });

    /**
     * Computes the Password-Based Key Derivation Function 2.
     *
     * @param {WordArray|string} password The password.
     * @param {WordArray|string} salt A salt.
     * @param {Object} cfg (Optional) The configuration options to use for this computation.
     *
     * @return {WordArray} The derived key.
     *
     * @static
     *
     * @example
     *
     *     var key = CryptoJS.PBKDF2(password, salt);
     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
     */
    C.PBKDF2 = function (password, salt, cfg) {
        return PBKDF2.create(cfg).compute(password, salt);
    };
}());
exports.CryptoJS = CryptoJS;

})()
},{}],11:[function(require,module,exports){
(function() {
  var C, Client, ENCODING, Record, config, crypt, derive, iced, sc, states, util, __iced_k, __iced_k_noop;

  iced = require('iced-coffee-script/lib/coffee-script/iced').runtime;
  __iced_k = __iced_k_noop = function() {};

  config = require('./config.iced').config;

  derive = require('./derive.iced');

  util = require('./util.iced');

  crypt = require('./crypt.iced');

  sc = require('./status.iced').codes;

  C = require('cryptojs-1sp').CryptoJS;

  states = {
    NONE: 0,
    LOGGED_IN: 1,
    VERIFIED: 2,
    WAITING_FOR_INPUT: 3
  };

  ENCODING = "base64";

  exports.Record = Record = (function() {
    function Record(key, value, encrypted) {
      this.key = key;
      this.value = value;
      this.encrypted = encrypted != null ? encrypted : false;
    }

    Record.prototype.encrypt = function(cryptor) {
      var k, v;
      k = cryptor.encrypt(this.key, false);
      v = cryptor.encrypt(this.value, true);
      return new Record(k, v, true);
    };

    Record.prototype.decrypt = function(cryptor) {
      var f, k, v, _ref;
      _ref = (function() {
        var _i, _len, _ref, _results;
        _ref = [this.key, this.value];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          _results.push(cryptor.decrypt(f));
        }
        return _results;
      }).call(this), k = _ref[0], v = _ref[1];
      if ((k != null) && (v != null)) {
        return new Record(k, v, false);
      }
    };

    Record.prototype.to_ajax = function() {
      return {
        rkey: this.key,
        rvalue: this.value
      };
    };

    Record.prototype.to_dict = function() {
      var d, k, v, _ref;
      d = {};
      _ref = this.value;
      for (k in _ref) {
        v = _ref[k];
        d[k] = v;
      }
      d.host = this.key;
      return d;
    };

    return Record;

  })();

  exports.Client = Client = (function() {
    function Client(_eng, _arg) {
      this._eng = _eng;
      this.url_prefix = _arg.url_prefix;
      this._active = false;
      this._state = states.NONE;
      this._session = null;
      this._records = {};
    }

    Client.prototype.resolve_url = function(u) {
      var p;
      if ((p = this.url_prefix) != null) {
        return [p, u].join('');
      } else {
        return u;
      }
    };

    Client.prototype.toggle = function(b) {
      this._active = b;
      if (b) {
        return this.login();
      } else {
        this._session = null;
        return this.doc().set_logged_in(false);
      }
    };

    Client.prototype.do_fetch = function(cb) {
      var rc, recs, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      rc = sc.OK;
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Client.do_fetch"
        });
        _this.prepare_keys(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return rc = arguments[0];
            };
          })(),
          lineno: 70
        }));
        __iced_deferrals._fulfill();
      })(function() {
        (function(__iced_k) {
          if (rc === sc.OK) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "Client.do_fetch"
              });
              _this.fetch_records(__iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    rc = arguments[0];
                    return recs = arguments[1];
                  };
                })(),
                lineno: 71
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        })(function() {
          if (rc === sc.OK) {
            rc = _this.decrypt_records(recs);
          }
          return cb(rc);
        });
      });
    };

    Client.prototype.decrypt = function(v, name) {
      return this._cryptor.decrypt(v, name);
    };

    Client.prototype.update_record = function(del, r) {
      if (del) {
        return this.delete_record(r);
      } else {
        return this.store_record(r);
      }
    };

    Client.prototype.store_record = function(r) {
      return this._records[r.key] = r;
    };

    Client.prototype.delete_record = function(r) {
      return delete this._records[r.key];
    };

    Client.prototype.decrypt_records = function(records) {
      var dr, eo, er, rc, _i, _len;
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        er = records[_i];
        if ((dr = er.decrypt(this._cryptor)) != null) {
          this.store_record(dr);
        }
      }
      rc = sc.OK;
      if ((eo = this._cryptor.finish()) != null) {
        rc = sc.BAD_DECODE;
        console.log("Decoding errors: " + (JSON.stringify(eo)));
      }
      return rc;
    };

    Client.prototype.check_res = function(res) {
      var _ref, _ref1;
      if (res.status === 200) {
        return res != null ? (_ref = res.data) != null ? (_ref1 = _ref.status) != null ? _ref1.code : void 0 : void 0 : void 0;
      } else {
        return null;
      }
    };

    Client.prototype.fetch_records = function(cb) {
      var code, rc, records, res, row, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      records = null;
      rc = sc.OK;
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Client.fetch_records"
        });
        _this.ajax("/records", {}, "GET", __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return res = arguments[0];
            };
          })(),
          lineno: 108
        }));
        __iced_deferrals._fulfill();
      })(function() {
        if (((code = _this.check_res(res)) != null) && code === 0) {
          records = (function() {
            var _i, _len, _ref, _ref1, _results;
            _ref1 = (_ref = res.data) != null ? _ref.data : void 0;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              row = _ref1[_i];
              _results.push(new Record(row.rkey, row.rvalue, true));
            }
            return _results;
          })();
        } else {
          rc = sc.BAD_FETCH;
        }
        return cb(rc, records);
      });
    };

    Client.prototype.prepare_keys = function(cb) {
      var rc, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Client.prepare_keys"
        });
        _this.prepare_key(derive.keymodes.RECORD_HMAC, __iced_deferrals.defer({
          assign_fn: (function(__slot_1) {
            return function() {
              return __slot_1._hmac = arguments[0];
            };
          })(_this),
          lineno: 118
        }));
        __iced_deferrals._fulfill();
      })(function() {
        (function(__iced_k) {
          if (_this._hmac) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "Client.prepare_keys"
              });
              _this.prepare_key(derive.keymodes.RECORD_AES, __iced_deferrals.defer({
                assign_fn: (function(__slot_1) {
                  return function() {
                    return __slot_1._aes = arguments[0];
                  };
                })(_this),
                lineno: 119
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        })(function() {
          rc = (_this._aes && _this._hmac) != null ? (_this._cryptor = new crypt.Cryptor(_this._aes, _this._hmac), sc.OK) : sc.BAD_DERIVE;
          return cb(rc);
        });
      });
    };

    Client.prototype.prepare_key = function(mode, cb) {
      var inp, key, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      inp = this.package_input(mode);
      (function(__iced_k) {
        if (inp != null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "Client.prepare_key"
            });
            inp.derive_key(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return key = arguments[0];
                };
              })(),
              lineno: 131
            }));
            __iced_deferrals._fulfill();
          })(__iced_k);
        } else {
          return __iced_k();
        }
      })(function() {
        return cb(key, inp);
      });
    };

    Client.prototype.package_input = function(mode) {
      var inp, res;
      inp = this._eng.fork_input(mode, config.server);
      if (!inp.is_ready()) {
        inp = null;
      }
      res = null;
      if ((inp != null) && !util.is_email(inp.get('email'))) {
        inp = null;
      }
      return inp;
    };

    Client.prototype.package_args = function(cb) {
      var inp, pwh, rc, res, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        if ((inp = _this.package_input(derive.keymodes.LOGIN_PW)) == null) {
          return __iced_k(rc = sc.BAD_ARGS);
        } else {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "Client.package_args"
            });
            inp.derive_key(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return pwh = arguments[0];
                };
              })(),
              lineno: 151
            }));
            __iced_deferrals._fulfill();
          })(function() {
            return __iced_k(typeof pwh !== "undefined" && pwh !== null ? (res = {
              pwh: pwh,
              email: inp.get('email')
            }, rc = sc.OK) : rc = sc.BAD_DERIVE);
          });
        }
      })(function() {
        return cb(rc, res, inp);
      });
    };

    Client.prototype.doc = function() {
      return this._eng._doc;
    };

    Client.prototype.login_loop = function() {
      var try_again, ___iced_passed_deferral, __iced_deferrals, __iced_k, _results, _while,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      try_again = true;
      _results = [];
      _while = function(__iced_k) {
        var _break, _continue, _next;
        _break = function() {
          return __iced_k(_results);
        };
        _continue = function() {
          return iced.trampoline(function() {
            return _while(__iced_k);
          });
        };
        _next = function(__iced_next_arg) {
          _results.push(__iced_next_arg);
          return _continue();
        };
        if (!try_again) {
          return _break();
        } else {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "Client.login_loop"
            });
            setTimeout(__iced_deferrals.defer({
              lineno: 168
            }), 5 * 1000);
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "Client.login_loop"
              });
              _this.login(true, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return try_again = arguments[0];
                  };
                })(),
                lineno: 169
              }));
              __iced_deferrals._fulfill();
            })(_next);
          });
        }
      };
      _while(__iced_k);
    };

    Client.prototype.is_logged_in = function() {
      return this._session;
    };

    Client.prototype.logout = function(cb) {
      var rc;
      rc = sc.OK;
      if (this.is_logged_in()) {
        this._session = null;
      } else {
        rc = sc.BAD_LOGIN;
      }
      if (cb != null) {
        return cb(rc);
      }
    };

    Client.prototype.login = function(cb) {
      var args, code, inp, rc, res, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      rc = this.is_logged_in() ? sc.LOGGED_IN : sc.OK;
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Client.login"
        });
        _this.package_args(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              rc = arguments[0];
              args = arguments[1];
              return inp = arguments[2];
            };
          })(),
          lineno: 187
        }));
        __iced_deferrals._fulfill();
      })(function() {
        code = null;
        (function(__iced_k) {
          if (rc === sc.OK) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "Client.login"
              });
              _this.ajax("/user/login", args, "POST", __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return res = arguments[0];
                  };
                })(),
                lineno: 190
              }));
              __iced_deferrals._fulfill();
            })(function() {
              (function(__iced_k) {
                if ((code = _this.check_res(res)) == null) {
                  return __iced_k(rc = sc.SERVER_DOWN);
                } else {
                  (function(__iced_k) {
                    if (code !== 0) {
                      return __iced_k(rc = sc.BAD_LOGIN);
                    } else {
                      _this._session = res.data.session;
                      (function(__iced_k) {
                        __iced_deferrals = new iced.Deferrals(__iced_k, {
                          parent: ___iced_passed_deferral,
                          funcname: "Client.login"
                        });
                        _this.do_fetch(__iced_deferrals.defer({
                          assign_fn: (function() {
                            return function() {
                              return rc = arguments[0];
                            };
                          })(),
                          lineno: 195
                        }));
                        __iced_deferrals._fulfill();
                      })(__iced_k);
                    }
                  })(__iced_k);
                }
              })(__iced_k);
            });
          } else {
            return __iced_k();
          }
        })(function() {
          return cb(rc);
        });
      });
    };

    Client.prototype.signup = function(cb) {
      var args, rc, res, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Client.signup"
        });
        _this.package_args(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              rc = arguments[0];
              return args = arguments[1];
            };
          })(),
          lineno: 201
        }));
        __iced_deferrals._fulfill();
      })(function() {
        (function(__iced_k) {
          if (rc === sc.OK) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "Client.signup"
              });
              _this.ajax("/user/signup", args, "POST", __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return res = arguments[0];
                  };
                })(),
                lineno: 203
              }));
              __iced_deferrals._fulfill();
            })(function() {
              return __iced_k((_this.check_res(res)) == null ? rc = sc.SERVER_DOWN : void 0);
            });
          } else {
            return __iced_k();
          }
        })(function() {
          return cb(rc);
        });
      });
    };

    Client.prototype.ajax = function(url, data, method, cb) {
      var error, success;
      url = this.resolve_url(url);
      error = function(x, status, error_thrown) {
        return cb({
          ok: false,
          status: x.status,
          data: null
        });
      };
      success = function(data, status, x) {
        return cb({
          ok: true,
          status: x.status,
          data: data
        });
      };
      if (this._session) {
        data.session = this._session;
      }
      return $.ajax({
        dataType: "json",
        url: url,
        data: data,
        success: success,
        error: error,
        type: method
      });
    };

    Client.prototype.get_stored_records = function() {
      var k, v, _ref, _results;
      _ref = this._records;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push(v.to_dict());
      }
      return _results;
    };

    Client.prototype.get_record = function(h) {
      var _ref;
      return (_ref = this._records[h]) != null ? _ref.to_dict() : void 0;
    };

    Client.prototype.push = function(cb) {
      return this._push_or_remove(false, cb);
    };

    Client.prototype.remove = function(cb) {
      return this._push_or_remove(true, cb);
    };

    Client.prototype._push_or_remove = function(del, cb) {
      var arec, erec, inp, method, rc, rec, res, ___iced_passed_deferral, __iced_deferrals, __iced_k,
        _this = this;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      rc = sc.OK;
      inp = this._eng.get_input();
      rec = inp.to_record();
      (function(__iced_k) {
        if (rec) {
          _this.update_record(del, rec);
          erec = rec.encrypt(_this._cryptor);
          arec = erec.to_ajax();
          method = del ? "DELETE" : "POST";
          if (del) {
            delete arec.rvalue;
          }
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "Client._push_or_remove"
            });
            _this.ajax("/records", arec, method, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return res = arguments[0];
                };
              })(),
              lineno: 240
            }));
            __iced_deferrals._fulfill();
          })(function() {
            return __iced_k((_this.check_res(res)) == null ? rc = sc.SERVER_DOWN : void 0);
          });
        } else {
          return __iced_k(rc = sc.BAD_ARGS);
        }
      })(function() {
        return cb(rc);
      });
    };

    Client.prototype.clear = function() {
      this.logout();
      return this._records = {};
    };

    return Client;

  })();

}).call(this);


},{"./config.iced":5,"./derive.iced":7,"./util.iced":10,"./crypt.iced":14,"./status.iced":4,"iced-coffee-script/lib/coffee-script/iced":8,"cryptojs-1sp":13}],12:[function(require,module,exports){
(function() {
  var Binary, C, Ui8a, pack_to_word_array, purepack, unpack_from_word_array;



  purepack = require('purepack');

  C = require('cryptojs-1sp').CryptoJS;

  exports.Binary = Binary = {
    stringify: function(wa) {
      var e, i, n, v, _ref;
      _ref = [wa.words, wa.sigBytes], v = _ref[0], n = _ref[1];
      e = String.fromCharCode;
      return ((function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
          _results.push(e((v[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff));
        }
        return _results;
      })()).join('');
    }
  };

  exports.Ui8a = Ui8a = {
    stringify: function(wa) {
      var i, n, out, v, _i, _ref;
      _ref = [wa.words, wa.sigBytes], v = _ref[0], n = _ref[1];
      out = new Uint8Array(n);
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        out[i] = (v[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }
      return out;
    },
    to_i32a: function(uia) {
      var b, i, n, nw, out, _i, _j, _len;
      n = uia.length;
      nw = (n >>> 2) + (n & 0x3 ? 1 : 0);
      out = new Int32Array(nw);
      for (i = _i = 0; 0 <= nw ? _i < nw : _i > nw; i = 0 <= nw ? ++_i : --_i) {
        out[i] = 0;
      }
      for (i = _j = 0, _len = uia.length; _j < _len; i = ++_j) {
        b = uia[i];
        out[i >>> 2] |= b << ((3 - (i & 0x3)) << 3);
      }
      return out;
    }
  };

  exports.pack_to_word_array = pack_to_word_array = function(obj) {
    var i32a, ui8a, v, w;
    ui8a = purepack.pack(obj, 'ui8a');
    i32a = Ui8a.to_i32a(ui8a);
    v = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = i32a.length; _i < _len; _i++) {
        w = i32a[_i];
        _results.push(w);
      }
      return _results;
    })();
    return C.lib.WordArray.create(v, ui8a.length);
  };

  exports.unpack_from_word_array = unpack_from_word_array = function(wa) {
    var ui8a;
    ui8a = wa.toString(Ui8a);
    return purepack.unpack(ui8a, 'ui8a');
  };

}).call(this);


},{"cryptojs-1sp":13,"purepack":15}],15:[function(require,module,exports){
(function(){// Generated by IcedCoffeeScript 1.6.2a
(function() {


  exports.pack = require('./pack').pack;

  exports.unpack = require('./unpack').unpack;

  exports.Buffer = require('./buffer').PpBuffer;

}).call(this);

})()
},{"./pack":16,"./unpack":17,"./buffer":18}],14:[function(require,module,exports){
(function() {
  var C, Cryptor, pack_to_word_array, prng, purepack, testit, unpack_from_word_array, _ref;



  purepack = require('purepack');

  prng = require('./prng.iced').prng;

  C = require('cryptojs-1sp').CryptoJS;

  _ref = require('./pack.iced'), pack_to_word_array = _ref.pack_to_word_array, unpack_from_word_array = _ref.unpack_from_word_array;

  exports.Cryptor = Cryptor = (function() {
    function Cryptor(_aes_key, _mac_key) {
      this._aes_key = _aes_key;
      this._mac_key = _mac_key;
      this._errors = [];
      this._mac_errors = 0;
      this._decode_errors = 0;
      this._aes_errors = 0;
      this._successes = 0;
    }

    Cryptor.prototype.finish = function() {
      var out;
      out = null;
      if (this._errors.length) {
        out = this._errors;
        this._errors = [];
      }
      return out;
    };

    Cryptor.prototype.hit_error = function(error, value, type) {
      return this._errors.push({
        error: error,
        value: value,
        type: type
      });
    };

    Cryptor.prototype.compute_mac = function(mac_obj) {
      var wa;
      wa = pack_to_word_array(mac_obj);
      return C.HmacSHA256(wa, this._mac_key);
    };

    Cryptor.prototype.verify_mac = function(obj, received) {
      var i, ret, w, words, _i, _len;
      words = this.compute_mac(obj).words;
      if (received.length !== words.length) {
        return false;
      }
      ret = true;
      for (i = _i = 0, _len = received.length; _i < _len; i = ++_i) {
        w = received[i];
        if (!(w === words[i])) {
          ret = false;
        }
      }
      return ret;
    };

    Cryptor.prototype.encrypt = function(obj, random_iv) {
      var BS, ciphertext, i, iv, mac, mac_obj, out_obj, vers, words;
      if (random_iv == null) {
        random_iv = true;
      }
      words = pack_to_word_array(obj);
      BS = C.algo.AES.blockSize;
      iv = random_iv ? prng.to_cryptojs_word_array(BS) : C.lib.WordArray.create((function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= BS ? _i < BS : _i > BS; i = 0 <= BS ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      })(), BS * 4);
      ciphertext = C.AES.encrypt(words, this._aes_key, {
        iv: iv
      }).ciphertext;
      mac_obj = [ciphertext.words, iv.words];
      mac = this.compute_mac(mac_obj);
      vers = 1;
      out_obj = [vers, mac.words].concat(mac_obj);
      return purepack.pack(out_obj, 'base64');
    };

    Cryptor.prototype.decrypt_aes = function(ctxt, iv) {
      var cfg, cp;
      iv = C.lib.WordArray.create(iv);
      ctxt = C.lib.WordArray.create(ctxt);
      cfg = {
        iv: iv
      };
      cp = C.lib.CipherParams.create({
        ciphertext: ctxt
      });
      return C.AES.decrypt(cp, this._aes_key, cfg);
    };

    Cryptor.prototype.decrypt = function(v, name) {
      var err, pt, ret, unpacked, _ref1, _ref2;
      ret = null;
      _ref1 = purepack.unpack(v, 'base64'), err = _ref1[0], unpacked = _ref1[1];
      if (err != null) {
        this.hit_error(err, v, name);
        this._decode_errors++;
      } else if (!(Array.isArray(unpacked))) {
        this.hit_error("needed an array", unpacked.toString(), name);
        this._decode_errors++;
      } else if (unpacked[0] !== 1) {
        this.hit_error("only can decode version 1", unpacked[0], name);
        this._decode_errors++;
      } else if (unpacked.length !== 4) {
        this.hit_error("needed 4 fields in array", unpacked.length, name);
        this._decode_errors++;
      } else if (!this.verify_mac(unpacked.slice(2, 4), unpacked[1])) {
        this.hit_error("MAC mismatch", unpacked.toString(), name);
        this._mac_errors++;
      } else if ((pt = this.decrypt_aes(unpacked[2], unpacked[3], name)) == null) {
        this.hit_error("Decrypt failure", unpacked.toString(), name);
        this._aes_errors++;
      } else if (((_ref2 = unpack_from_word_array(pt), err = _ref2[0], ret = _ref2[1], _ref2) == null) || (err != null)) {
        this.hit_error("Failed to decode plaintext", err, name);
        this._decode_errors++;
      }
      return ret;
    };

    return Cryptor;

  })();

  testit = function() {
    var ak, cryptor, d, e, mk, obj;
    ak = C.lib.WordArray.create([0, 1, 2, 3, 4, 5, 6, 7]);
    mk = C.lib.WordArray.create([100, 101, 102, 103, 104, 105, 106, 107]);
    cryptor = new Cryptor(ak, mk);
    obj = {
      a: 1,
      b: 2,
      c: [0, 1, 2, 3],
      d: "holy smokes",
      e: false
    };
    console.log("Obj ->");
    console.log(obj);
    e = cryptor.encrypt(obj);
    console.log("Enc ->");
    console.log(e);
    d = cryptor.decrypt(e, "stuff");
    console.log("Dec ->");
    console.log(d);
    return console.log(cryptor.finish());
  };

}).call(this);


},{"./prng.iced":19,"./pack.iced":12,"cryptojs-1sp":13,"purepack":15}],16:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var C, Packer, PpBuffer, U32MAX, is_array, is_int, u64max_minus_i;



  C = require('./const').C;

  PpBuffer = require('./buffer').PpBuffer;

  U32MAX = require('./util').U32MAX;

  is_array = function(x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };

  is_int = function(f) {
    return Math.floor(f) === f;
  };

  u64max_minus_i = function(i) {
    var a, b, x, y;
    x = Math.floor(i / U32MAX);
    y = i % U32MAX;
    a = U32MAX - x - (y > 0 ? 1 : 0);
    b = y === 0 ? 0 : U32MAX - y;
    return [a, b];
  };

  exports.Packer = Packer = (function() {
    function Packer(_opts) {
      this._opts = _opts != null ? _opts : {};
      this._buffer = new PpBuffer();
    }

    Packer.prototype.output = function(enc) {
      return this._buffer.toString(enc);
    };

    Packer.prototype.p = function(o) {
      var ba;
      switch (typeof o) {
        case 'number':
          return this.p_number(o);
        case 'string':
          return this.p_utf8_string(o);
        case 'boolean':
          return this.p_boolean(o);
        case 'undefined':
          return this.p_null();
        case 'object':
          if (o == null) {
            return this.p_null();
          } else if (is_array(o)) {
            return this.p_array(o);
          } else if ((ba = PpBuffer.to_byte_array(o))) {
            return this.p_byte_array(ba);
          } else {
            return this.p_obj(o);
          }
      }
    };

    Packer.prototype.p_number = function(n) {
      if (!is_int(n)) {
        return this.p_pack_double(n);
      } else if (n >= 0) {
        return this.p_positive_int(n);
      } else {
        return this.p_negative_int(n);
      }
    };

    Packer.prototype.p_pack_double = function(d) {
      if (this._opts.floats != null) {
        this.p_uint8(C.float);
        return this._buffer.push_float32(d);
      } else {
        this.p_uint8(C.double);
        return this._buffer.push_float64(d);
      }
    };

    Packer.prototype.p_uint8 = function(b) {
      return this._buffer.push_uint8(b);
    };

    Packer.prototype.p_uint16 = function(s) {
      return this._buffer.push_uint16(s);
    };

    Packer.prototype.p_uint32 = function(w) {
      return this._buffer.push_uint32(w);
    };

    Packer.prototype.p_int8 = function(b) {
      return this._buffer.push_int8(b);
    };

    Packer.prototype.p_int16 = function(s) {
      return this._buffer.push_int16(s);
    };

    Packer.prototype.p_int32 = function(w) {
      return this._buffer.push_int32(w);
    };

    Packer.prototype.p_neg_int64 = function(i) {
      var a, abs_i, b, _ref;
      abs_i = 0 - i;
      _ref = u64max_minus_i(abs_i), a = _ref[0], b = _ref[1];
      this.p_uint32(a);
      return this.p_uint32(b);
    };

    Packer.prototype.p_boolean = function(b) {
      return this.p_uint8(b ? C["true"] : C["false"]);
    };

    Packer.prototype.p_null = function() {
      return this.p_uint8(C["null"]);
    };

    Packer.prototype.p_array = function(a) {
      var e, _i, _len, _results;
      this.p_len(a.length, C.fix_array_min, C.fix_array_max, C.array16, C.array32);
      _results = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        e = a[_i];
        _results.push(this.p(e));
      }
      return _results;
    };

    Packer.prototype.p_obj = function(o) {
      var k, n, v, _results;
      n = (Object.keys(o)).length;
      this.p_len(n, C.fix_map_min, C.fix_map_max, C.map16, C.map32);
      _results = [];
      for (k in o) {
        v = o[k];
        this.p(k);
        _results.push(this.p(v));
      }
      return _results;
    };

    Packer.prototype.p_positive_int = function(i) {
      if (i <= 0x7f) {
        return this.p_uint8(i);
      } else if (i <= 0xff) {
        this.p_uint8(C.uint8);
        return this.p_uint8(i);
      } else if (i <= 0xffff) {
        this.p_uint8(C.uint16);
        return this.p_uint16(i);
      } else if (i < U32MAX) {
        this.p_uint8(C.uint32);
        return this.p_uint32(i);
      } else {
        this.p_uint8(C.uint64);
        this.p_uint32(Math.floor(i / U32MAX));
        return this.p_uint32(i & (U32MAX - 1));
      }
    };

    Packer.prototype.p_negative_int = function(i) {
      if (i >= -32) {
        return this.p_int8(i);
      } else if (i >= -128) {
        this.p_uint8(C.int8);
        return this.p_int8(i);
      } else if (i >= -32768) {
        this.p_uint8(C.int16);
        return this.p_int16(i);
      } else if (i >= -2147483648) {
        this.p_uint8(C.int32);
        return this.p_int32(i);
      } else {
        this.p_uint8(C.int64);
        return this.p_neg_int64(i);
      }
    };

    Packer.prototype.p_byte_array = function(b) {
      if (this._opts.byte_arrays) {
        this.p_uint8(C.byte_array);
      } else {
        b = PpBuffer.ui8a_to_binary(b);
      }
      this.p_len(b.length, C.fix_raw_min, C.fix_raw_max, C.raw16, C.raw32);
      return this._buffer.push_buffer(b);
    };

    Packer.prototype.p_utf8_string = function(b) {
      b = PpBuffer.utf8_to_ui8a(b);
      this.p_len(b.length, C.fix_raw_min, C.fix_raw_max, C.raw16, C.raw32);
      return this._buffer.push_buffer(b);
    };

    Packer.prototype.p_len = function(l, smin, smax, m, b) {
      if (l <= (smax - smin)) {
        return this.p_uint8(l | smin);
      } else if (l <= 0xffff) {
        this.p_uint8(m);
        return this.p_uint16(l);
      } else {
        this.p_uint8(b);
        return this.p_uint32(l);
      }
    };

    return Packer;

  })();

  exports.pack = function(x, enc, opts) {
    var packer;
    if (opts == null) {
      opts = {};
    }
    packer = new Packer(opts);
    packer.p(x);
    return packer.output(enc);
  };

}).call(this);

},{"./const":20,"./buffer":18,"./util":21}],17:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var C, PpBuffer, U32MAX, Unpacker, modes, pow2, twos_compl_inv, _ref;



  C = require('./const').C;

  PpBuffer = require('./buffer').PpBuffer;

  _ref = require('./util'), pow2 = _ref.pow2, twos_compl_inv = _ref.twos_compl_inv, U32MAX = _ref.U32MAX;

  modes = {
    NONE: 0,
    BINARY: 1,
    START: 2
  };

  exports.Unpacker = Unpacker = (function() {
    function Unpacker() {
      this._buffer = null;
    }

    Unpacker.prototype.decode = function(s, enc) {
      return !!(this._buffer = PpBuffer.decode(s, enc));
    };

    Unpacker.prototype.u_bytes = function(n, mode) {
      if (mode === modes.BINARY) {
        return this._buffer.read_byte_array(n);
      } else {
        return this._buffer.read_utf8_string(n);
      }
    };

    Unpacker.prototype.get_errors = function() {
      return this._buffer.get_errors();
    };

    Unpacker.prototype.u_array = function(n) {
      var i, _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        _results.push(this.u());
      }
      return _results;
    };

    Unpacker.prototype.u_map = function(n) {
      var i, ret, _i;
      ret = {};
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        ret[this.u()] = this.u();
      }
      return ret;
    };

    Unpacker.prototype.u_uint8 = function() {
      return this._buffer.read_uint8();
    };

    Unpacker.prototype.u_uint16 = function() {
      return this._buffer.read_uint16();
    };

    Unpacker.prototype.u_uint32 = function() {
      return this._buffer.read_uint32();
    };

    Unpacker.prototype.u_int8 = function() {
      return this._buffer.read_int8();
    };

    Unpacker.prototype.u_int16 = function() {
      return this._buffer.read_int16();
    };

    Unpacker.prototype.u_int32 = function() {
      return this._buffer.read_int32();
    };

    Unpacker.prototype.u_uint64 = function() {
      return (this.u_uint32() * U32MAX) + this.u_uint32();
    };

    Unpacker.prototype.u_double = function() {
      return this._buffer.read_float64();
    };

    Unpacker.prototype.u_float = function() {
      return this._buffer.read_float32();
    };

    Unpacker.prototype.u_int64 = function() {
      var a, b, i, _ref1;
      _ref1 = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 2; i = ++_i) {
          _results.push(this.u_uint32());
        }
        return _results;
      }).call(this), a = _ref1[0], b = _ref1[1];
      return U32MAX * (a - U32MAX) + b;
    };

    Unpacker.prototype.error = function(e) {
      this._e.push(e);
      return null;
    };

    Unpacker.prototype.u_inner = function(last_mode) {
      var b, l, mode, ret;
      mode = modes.NONE;
      b = this._buffer.read_uint8();
      ret = (function() {
        if (b <= C.positive_fix_max) {
          return b;
        } else if (b >= C.negative_fix_min && b <= C.negative_fix_max) {
          return twos_compl_inv(b, 8);
        } else if (b >= C.fix_raw_min && b <= C.fix_raw_max) {
          l = b & C.fix_raw_count_mask;
          return this.u_bytes(l, last_mode);
        } else if (b >= C.fix_array_min && b <= C.fix_array_max) {
          l = b & C.fix_array_count_mask;
          return this.u_array(l);
        } else if (b >= C.fix_map_min && b <= C.fix_map_max) {
          l = b & C.fix_map_count_mask;
          return this.u_map(l);
        } else if (b === C.byte_array) {
          mode = modes.BINARY;
          return null;
        } else {
          switch (b) {
            case C["null"]:
              return null;
            case C["true"]:
              return true;
            case C["false"]:
              return false;
            case C.uint8:
              return this.u_uint8();
            case C.uint16:
              return this.u_uint16();
            case C.uint32:
              return this.u_uint32();
            case C.uint64:
              return this.u_uint64();
            case C.int8:
              return this.u_int8();
            case C.int16:
              return this.u_int16();
            case C.int32:
              return this.u_int32();
            case C.int64:
              return this.u_int64();
            case C.double:
              return this.u_double();
            case C.float:
              return this.u_float();
            case C.raw16:
              return this.u_bytes(this.u_uint16(), last_mode);
            case C.raw32:
              return this.u_bytes(this.u_uint32(), last_mode);
            case C.array16:
              return this.u_array(this.u_uint16());
            case C.array32:
              return this.u_array(this.u_uint32());
            case C.map16:
              return this.u_map(this.u_uint16());
            case C.map32:
              return this.u_map(this.u_uint32());
            default:
              return this.error("unhandled type " + b);
          }
        }
      }).call(this);
      return [mode, ret];
    };

    Unpacker.prototype.u = function() {
      var mode, ret, _ref1;
      mode = modes.START;
      while (mode !== modes.NONE) {
        _ref1 = this.u_inner(mode), mode = _ref1[0], ret = _ref1[1];
      }
      return ret;
    };

    return Unpacker;

  })();

  exports.unpack = function(x, enc) {
    var err, res, unpacker;
    unpacker = new Unpacker;
    err = null;
    res = null;
    if (unpacker.decode(x, enc)) {
      res = unpacker.u();
      err = unpacker.get_errors();
    } else {
      err = "Decoding type '" + enc + "' failed";
    }
    return [err, res];
  };

}).call(this);

},{"./const":20,"./buffer":18,"./util":21}],18:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var browser, node;



  browser = require('./browser');

  if (typeof window === "undefined" || window === null) {
    node = require('./node');
  }

  exports.PpBuffer = node != null ? node.PpBuffer : browser.PpBuffer;

  exports.force = function(which) {
    return exports.PpBuffer = which;
  };

}).call(this);

},{"./browser":22,"./node":23}],20:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.6.2a
(function() {


  exports.C = {
    "null": 0xc0,
    "false": 0xc2,
    "true": 0xc3,
    byte_array: 0xc4,
    float: 0xca,
    double: 0xcb,
    uint8: 0xcc,
    uint16: 0xcd,
    uint32: 0xce,
    uint64: 0xcf,
    int8: 0xd0,
    int16: 0xd1,
    int32: 0xd2,
    int64: 0xd3,
    raw16: 0xda,
    raw32: 0xdb,
    array16: 0xdc,
    array32: 0xdd,
    map16: 0xde,
    map32: 0xdf,
    fix_raw_min: 0xa0,
    fix_raw_max: 0xbf,
    fix_array_min: 0x90,
    fix_array_max: 0x9f,
    fix_map_min: 0x80,
    fix_map_max: 0x8f,
    fix_array_count_mask: 0xf,
    fix_map_count_mask: 0xf,
    fix_raw_count_mask: 0x1f,
    negative_fix_min: 0xe0,
    negative_fix_max: 0xff,
    negative_fix_mask: 0x1f,
    negative_fix_offset: 0x20,
    positive_fix_max: 0x7f,
    rpc_request: 0x00,
    rpc_response: 0x01,
    rpc_notify: 0x02
  };

}).call(this);

},{}],21:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var U32MAX, pow2;



  exports.pow2 = pow2 = function(n) {
    if (n < 31) {
      return 1 << n;
    } else {
      return Math.pow(2, n);
    }
  };

  exports.U32MAX = U32MAX = pow2(32);

  exports.rshift = function(b, n) {
    if (n < 31) {
      return b >> n;
    } else {
      return Math.floor(b / Math.pow(2, n));
    }
  };

  exports.twos_compl = function(x, n) {
    if (x < 0) {
      return pow2(n) - Math.abs(x);
    } else {
      return x;
    }
  };

  exports.twos_compl_inv = function(x, n) {
    return x - pow2(n);
  };

}).call(this);

},{}],22:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var BrowserBuffer, base, encode_byte, first_non_ascii, pow2, rshift, twos_compl, twos_compl_inv, uri_encode_chunk, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };



  _ref = require('./util'), pow2 = _ref.pow2, rshift = _ref.rshift, twos_compl_inv = _ref.twos_compl_inv, twos_compl = _ref.twos_compl;

  base = require('./base');

  exports.PpBuffer = BrowserBuffer = (function(_super) {
    __extends(BrowserBuffer, _super);

    function BrowserBuffer() {
      BrowserBuffer.__super__.constructor.call(this);
      this._buffers = [];
      this._sz = 0x1000;
      this._logsz = 12;
      this._push_new_buffer();
      this._i = 0;
      this._b = 0;
      this._no_push = false;
      this._e = [];
    }

    BrowserBuffer.prototype._push_new_buffer = function() {
      var nb;
      this._b = this._buffers.length;
      this._i = 0;
      nb = new Uint8Array(this._sz);
      this._buffers.push(nb);
      return nb;
    };

    BrowserBuffer.prototype._left_in_buffer = function() {
      return this._sz - this._i;
    };

    BrowserBuffer.decode = function(s, enc) {
      return base.PpBuffer._decode(BrowserBuffer, s, enc);
    };

    BrowserBuffer.prototype.push_uint8 = function(b) {
      var buf;
      if (this._no_push) {
        throw new Error("Cannot push anymore into this buffer");
      }
      buf = this._buffers[this._b];
      if (this._i === this._sz) {
        buf = this._push_new_buffer();
      }
      buf[this._i++] = b;
      return this._tot++;
    };

    BrowserBuffer.prototype.push_int8 = function(b) {
      return this.push_uint8(b);
    };

    BrowserBuffer.prototype.push_int16 = function(i) {
      return this.push_uint16(twos_compl(i, 16));
    };

    BrowserBuffer.prototype.push_int32 = function(i) {
      return this.push_uint32(twos_compl(i, 32));
    };

    BrowserBuffer.prototype.push_float32 = function(val) {
      var dv, tmp;
      tmp = new Uint8Array(4);
      dv = new DataView(tmp);
      dv.setFloat32(0, val, false);
      return this.push_buffer(tmp);
    };

    BrowserBuffer.prototype.push_float64 = function(val) {
      var dv, tmp;
      tmp = new Uint8Array(8);
      dv = new DataView(tmp);
      dv.setFloat64(0, val, false);
      return this.push_buffer(tmp);
    };

    BrowserBuffer.prototype.push_uint16 = function(i) {
      this.push_uint8((i >> 8) & 0xff);
      return this.push_uint8(i & 0xff);
    };

    BrowserBuffer.prototype.push_uint32 = function(i) {
      this.push_uint8((i >> 24) & 0xff);
      this.push_uint8((i >> 16) & 0xff);
      this.push_uint8((i >> 8) & 0xff);
      return this.push_uint8(i & 0xff);
    };

    BrowserBuffer.prototype.push_raw_bytes = function(s) {
      var a, i, _i, _ref1;
      a = new Uint8Array(s.length);
      for (i = _i = 0, _ref1 = s.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        a[i] = s.charCodeAt(i);
      }
      return this.push_buffer(a);
    };

    BrowserBuffer.prototype.push_buffer = function(input) {
      var bp, ep, lib, n, slab;
      bp = 0;
      ep = input.length;
      while (bp < ep) {
        lib = this._left_in_buffer();
        if (lib === 0) {
          slab = this._push_new_buffer();
          lib = this._left_in_buffer();
        } else {
          slab = this._buffers[this._b];
        }
        n = Math.min(lib, ep - bp);
        slab.set(input.subarray(bp, bp + n), this._i);
        this._i += n;
        this._tot += n;
        bp += n;
      }
      return this;
    };

    BrowserBuffer.prototype._zero_pad = function(n) {
      var j, _i, _results;
      if (n != null) {
        _results = [];
        for (j = _i = 0; 0 <= n ? _i < n : _i > n; j = 0 <= n ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      } else {
        return 0;
      }
    };

    BrowserBuffer.prototype._get = function(i, n) {
      var bi, li, lim, ret;
      if (n == null) {
        n = null;
      }
      ret = i >= this._tot ? this._zero_pad(n) : (bi = this._logsz ? i >>> this._logsz : 0, li = i % this._sz, lim = bi === this._b ? this._i : this._sz, ret = bi > this._b || li >= lim ? this._zero_pad(n) : n == null ? this._buffers[bi][li] : (n = Math.min(lim - li, n), this._buffers[bi].subarray(li, li + n)));
      return ret;
    };

    BrowserBuffer.prototype.ui8a_decode = function(v) {
      this._buffers = [v];
      this._logsz = 0;
      this._tot = this._sz = this._i = v.length;
      this._no_push = true;
      return this;
    };

    BrowserBuffer.prototype.read_uint8 = function() {
      return this._get(this._cp++);
    };

    BrowserBuffer.prototype.read_uint16 = function() {
      return (this.read_uint8() << 8) | this.read_uint8();
    };

    BrowserBuffer.prototype.read_uint32 = function() {
      return (this.read_uint8() * pow2(24)) + ((this.read_uint8() << 16) | (this.read_uint8() << 8) | this.read_uint8());
    };

    BrowserBuffer.prototype.read_int8 = function() {
      return twos_compl_inv(this.read_uint8(), 8);
    };

    BrowserBuffer.prototype.read_int16 = function() {
      return twos_compl_inv(this.read_uint16(), 16);
    };

    BrowserBuffer.prototype.read_int32 = function() {
      return twos_compl_inv(this.read_uint32(), 32);
    };

    BrowserBuffer.prototype.read_float64 = function() {
      var a, dv;
      a = this.read_byte_array(8);
      dv = new DataView(a);
      return dv.getFloat64(0, false);
    };

    BrowserBuffer.prototype.read_float32 = function() {
      var a, dv;
      a = this.read_byte_array(4);
      dv = new DataView(a);
      return dv.getFloat32(0, false);
    };

    BrowserBuffer.prototype.read_chunk = function(n) {
      var ret;
      ret = this._get(this._cp, n);
      this._cp += ret.length;
      return ret;
    };

    BrowserBuffer.prototype.read_byte_array = function(n) {
      var chnk, i, ret;
      i = 0;
      ret = null;
      n = this.prep_byte_grab(n);
      chnk = this.read_chunk(n);
      if (chnk.length === n) {
        ret = chnk;
      } else {
        ret = new Uint8Array(n);
        ret.set(chnk, 0);
        i = chnk.length;
        while (i < n) {
          chnk = this.read_chunk(n - i);
          ret.set(chnk, i);
          i += chnk.length;
        }
      }
      return ret;
    };

    BrowserBuffer.prototype.prep_byte_grab = function(n) {
      var bl;
      bl = this.bytes_left();
      if (n > bl) {
        this._e.push("Corruption: asked for " + n + " bytes, but only " + bl + " available");
        n = bl;
      }
      return n;
    };

    BrowserBuffer.prototype.read_utf8_string = function(n) {
      var chnk, chnksz, e, i, ret, s, tmp;
      i = 0;
      n = this.prep_byte_grab(n);
      chnksz = 0x400;
      tmp = (function() {
        var _results;
        _results = [];
        while (i < n) {
          s = Math.min(n - i, chnksz);
          chnk = this.read_chunk(s);
          i += chnk.length;
          _results.push(uri_encode_chunk(chnk));
        }
        return _results;
      }).call(this);
      try {
        ret = decodeURIComponent(tmp.join(''));
      } catch (_error) {
        e = _error;
        this._e.push("Invalid UTF-8 sequence");
        ret = "";
      }
      return ret;
    };

    BrowserBuffer.utf8_to_ui8a = function(s) {
      var c, i, n, ret, rp;
      s = encodeURIComponent(s);
      n = s.length;
      ret = new Uint8Array(s.length);
      rp = 0;
      i = 0;
      while (i < n) {
        c = s[i];
        if (c === '%') {
          c = parseInt(s.slice(i + 1, +(i + 2) + 1 || 9e9), 16);
          i += 3;
        } else {
          c = c.charCodeAt(0);
          i++;
        }
        ret[rp++] = c;
      }
      return ret.subarray(0, rp);
    };

    BrowserBuffer.ui8a_to_binary = function(b) {
      var chnksz, i, n, parts, s;
      chnksz = 0x100;
      n = b.length;
      i = 0;
      parts = [];
      while (i < n) {
        s = Math.min(n - i, chnksz);
        parts.push(String.fromCharCode.apply(String, b.subarray(i, i + s)));
        i += n;
      }
      return parts.join('');
    };

    BrowserBuffer.to_byte_array = function(b) {
      if (base.is_uint8_array(b)) {
        return b;
      } else {
        return null;
      }
    };

    BrowserBuffer.type = function() {
      return 'browser';
    };

    return BrowserBuffer;

  })(base.PpBuffer);

  first_non_ascii = function(chunk, start, end) {
    var i, _i;
    for (i = _i = start; start <= end ? _i < end : _i > end; i = start <= end ? ++_i : --_i) {
      if (chunk[i] >= 0x80 || chunk[i] === 0x25) {
        return i;
      }
    }
    return end;
  };

  encode_byte = function(b) {
    var lb, ub;
    ub = ((b >>> 4) & 0xf).toString(16);
    lb = (b & 0xf).toString(16);
    return "%" + ub + lb;
  };

  uri_encode_chunk = function(chunk) {
    var fna, i, n, out, parts, sa;
    n = chunk.length;
    i = 0;
    parts = (function() {
      var _results;
      _results = [];
      while (i < n) {
        fna = first_non_ascii(chunk, i, n);
        if (fna > i) {
          sa = chunk.subarray(i, fna);
          i = fna;
          _results.push(String.fromCharCode.apply(String, sa));
        } else {
          _results.push(encode_byte(chunk[i++]));
        }
      }
      return _results;
    })();
    out = parts.join('');
    return out;
  };

}).call(this);

},{"./util":21,"./base":24}],25:[function(require,module,exports){
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],2:[function(require,module,exports){
(function(){// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

})()
},{"util":3,"buffer":4}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],"q9TxCC":[function(require,module,exports){
(function(){function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

})()
},{"assert":2,"./buffer_ieee754":1,"base64-js":5}],3:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":6}],5:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],7:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":8}],4:[function(require,module,exports){
(function(){function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    val |= buffer.parent[buffer.offset + offset + 1];
  } else {
    val = buffer.parent[buffer.offset + offset];
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset + 1] << 16;
    val |= buffer.parent[buffer.offset + offset + 2] << 8;
    val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    val = buffer.parent[buffer.offset + offset + 2] << 16;
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer.parent[buffer.offset + offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;
  } else {
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;
  } else {
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

})()
},{"assert":2,"./buffer_ieee754":7,"base64-js":9}],9:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],23:[function(require,module,exports){
(function(Buffer){// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var NativeBuffer, NodeBuffer, base, twos_compl_inv,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };



  base = require('./base');

  twos_compl_inv = require('./util').twos_compl_inv;

  NativeBuffer = Buffer;

  exports.PpBuffer = NodeBuffer = (function(_super) {
    __extends(NodeBuffer, _super);

    function NodeBuffer() {
      NodeBuffer.__super__.constructor.call(this);
      this._frozen_buf = null;
      this._sub_buffers = [];
      this._limits = [];
      this._sz = 0x400;
      this._small_buf_sz = 0x100;
      this._logsz = 10;
      this._i = 0;
    }

    NodeBuffer.decode = function(s, enc) {
      if ((enc == null) && NativeBuffer.isBuffer(s)) {
        return (new NodeBuffer).buffer_decode(s);
      } else {
        return base.PpBuffer._decode(NodeBuffer, s, enc);
      }
    };

    NodeBuffer.prototype._nb = function() {
      return this._sub_buffers.length;
    };

    NodeBuffer.prototype._ab = function() {
      return this._sub_buffers[this._nb() - 1];
    };

    NodeBuffer.prototype._lib = function() {
      return 0;
    };

    NodeBuffer.prototype._finish_sub_buffer = function() {
      this._limits.push(this._i);
      return this._i = 0;
    };

    NodeBuffer.prototype._push_sub_buffer = function(b) {
      if (this._sub_buffers.length) {
        this._finish_sub_buffer();
      }
      this._lib = function() {
        return b.length - this._i;
      };
      this._sub_buffers.push(b);
      return b;
    };

    NodeBuffer.prototype._make_room = function() {
      return this._push_sub_buffer(new NativeBuffer(this._sz));
    };

    NodeBuffer.prototype._make_room_for_n_bytes = function(n) {
      if (this._lib() < n) {
        return this._make_room();
      }
    };

    NodeBuffer.prototype.push_uint8 = function(b) {
      var buf;
      if (this._no_push) {
        throw new Error("Cannot push anymore into this buffer");
      }
      buf = this._lib() === 0 ? this._make_room() : this._ab();
      buf[this._i++] = b;
      return this._tot++;
    };

    NodeBuffer.prototype.push_int8 = function(b) {
      return this.push_uint8(b);
    };

    NodeBuffer.prototype.push_uint16 = function(s) {
      var n;
      n = 2;
      this._make_room_for_n_bytes(n);
      this._ab().writeUInt16BE(s, this._i);
      this._i += n;
      return this._tot += n;
    };

    NodeBuffer.prototype.push_uint32 = function(w) {
      var n;
      n = 4;
      this._make_room_for_n_bytes(n);
      this._ab().writeUInt32BE(w, this._i);
      this._i += n;
      return this._tot += n;
    };

    NodeBuffer.prototype.push_int16 = function(s) {
      var n;
      n = 2;
      this._make_room_for_n_bytes(n);
      this._ab().writeInt16BE(s, this._i);
      this._i += n;
      return this._tot += n;
    };

    NodeBuffer.prototype.push_int32 = function(w) {
      var n;
      n = 4;
      this._make_room_for_n_bytes(n);
      this._ab().writeInt32BE(w, this._i);
      this._i += n;
      return this._tot += n;
    };

    NodeBuffer.prototype.push_float64 = function(f) {
      var n;
      n = 8;
      this._make_room_for_n_bytes(n);
      this._ab().writeDoubleBE(f, this._i);
      this._i += n;
      return this._tot += n;
    };

    NodeBuffer.prototype.push_float32 = function(f) {
      var n;
      n = 4;
      this._make_room_for_n_bytes(n);
      this._ab().writeFloatBE(f, this._i);
      this._i += n;
      return this._tot += n;
    };

    NodeBuffer.prototype.push_raw_bytes = function(s) {
      return this.push_buffer(new NativeBuffer(s, 'binary'));
    };

    NodeBuffer.prototype.push_buffer = function(b) {
      var diff, n;
      if (b.length > this._small_buf_sz) {
        this._push_sub_buffer(b);
        this._i = b.length;
        this._tot += b.length;
      } else {
        n = Math.min(b.length, this._lib());
        if (n > 0) {
          b.copy(this._ab(), this._i, 0, n);
          this._i += n;
          this._tot += n;
        }
        if (n < b.length) {
          this._make_room();
          b.copy(this._ab(), this._i, n, b.length);
          diff = b.length - n;
          this._i += diff;
          this._tot += diff;
        }
      }
      return this;
    };

    NodeBuffer.prototype._freeze = function() {
      var b, i, l, lst, _i, _len, _ref;
      if (this._frozen_buf == null) {
        this._finish_sub_buffer();
        lst = [];
        _ref = this._sub_buffers;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          b = _ref[i];
          if ((l = this._limits[i]) === b.length) {
            lst.push(b);
          } else if (l > 0) {
            lst.push(b.slice(0, l));
          }
        }
        this._sub_buffers = [];
        this._frozen_buf = NativeBuffer.concat(lst, this._tot);
      }
      return this._frozen_buf;
    };

    NodeBuffer.prototype._freeze_to = function(b) {
      this._frozen_buf = b;
      this._tot = b.length;
      this._sub_buffers = [];
      return this;
    };

    NodeBuffer.prototype._prepare_encoding = function() {
      return this._freeze();
    };

    NodeBuffer.prototype.base64_encode = function() {
      return this._freeze().toString('base64');
    };

    NodeBuffer.prototype.base16_encode = function() {
      return this._freeze().toString('hex');
    };

    NodeBuffer.prototype.binary_encode = function() {
      return this._freeze().toString('binary');
    };

    NodeBuffer.prototype.ui8a_encode = function() {
      return new Uint8Array(this._freeze());
    };

    NodeBuffer.prototype.buffer_encode = function() {
      return this._freeze();
    };

    NodeBuffer.prototype.base64_decode = function(d) {
      return this._freeze_to(new NativeBuffer(d, 'base64'));
    };

    NodeBuffer.prototype.base16_decode = function(d) {
      return this._freeze_to(new NativeBuffer(d, 'hex'));
    };

    NodeBuffer.prototype.binary_decode = function(d) {
      return this._freeze_to(new NativeBuffer(d, 'binary'));
    };

    NodeBuffer.prototype.ui8a_decode = function(d) {
      return this._freeze_to(new NativeBuffer(d));
    };

    NodeBuffer.prototype.buffer_decode = function(d) {
      return this._freeze_to(d);
    };

    NodeBuffer.prototype._get = function(i) {
      if (i < this._tot) {
        return this._frozen_buf[i];
      } else {
        return 0;
      }
    };

    NodeBuffer.prototype.read_uint8 = function() {
      return this._get(this._cp++);
    };

    NodeBuffer.prototype.read_int8 = function() {
      return twos_compl_inv(this.read_uint8(), 8);
    };

    NodeBuffer.prototype.read_uint16 = function() {
      var ret;
      ret = this._frozen_buf.readUInt16BE(this._cp);
      this._cp += 2;
      return ret;
    };

    NodeBuffer.prototype.read_uint32 = function() {
      var ret;
      ret = this._frozen_buf.readUInt32BE(this._cp);
      this._cp += 4;
      return ret;
    };

    NodeBuffer.prototype.read_int16 = function() {
      var ret;
      ret = this._frozen_buf.readInt16BE(this._cp);
      this._cp += 2;
      return ret;
    };

    NodeBuffer.prototype.read_int32 = function() {
      var ret;
      ret = this._frozen_buf.readInt32BE(this._cp);
      this._cp += 4;
      return ret;
    };

    NodeBuffer.prototype.read_float64 = function() {
      var ret;
      ret = this._frozen_buf.readDoubleBE(this._cp);
      this._cp += 8;
      return ret;
    };

    NodeBuffer.prototype.read_float32 = function() {
      var ret;
      ret = this._frozen_buf.readFloatBE(this._cp);
      this._cp += 4;
      return ret;
    };

    NodeBuffer.prototype.read_byte_array = function(n) {
      var bl, e, ret;
      bl = this.bytes_left();
      if (n > bl) {
        this._e.push("Corruption: asked for " + n + " bytes, but only " + bl + " available");
        n = bl;
      }
      e = this._cp + n;
      ret = this._frozen_buf.slice(this._cp, e);
      this._cp = e;
      return ret;
    };

    NodeBuffer.prototype.read_utf8_string = function(n) {
      return this.read_byte_array(n).toString('utf8');
    };

    NodeBuffer.utf8_to_ui8a = function(s) {
      return new NativeBuffer(s, 'utf8');
    };

    NodeBuffer.ui8a_to_binary = function(s) {
      return s;
    };

    NodeBuffer.to_byte_array = function(b) {
      if (NativeBuffer.isBuffer(b)) {
        return b;
      } else if (base.is_uint8_array(b)) {
        return new NativeBuffer(b);
      } else {
        return null;
      }
    };

    NodeBuffer.type = function() {
      return 'node';
    };

    return NodeBuffer;

  })(base.PpBuffer);

}).call(this);

})(require("__browserify_buffer").Buffer)
},{"./base":24,"./util":21,"__browserify_buffer":25}],24:[function(require,module,exports){
// Generated by IcedCoffeeScript 1.6.2a
(function() {
  var BaseBuffer, CharMap, pow2, rshift, twos_compl_inv, _ref;



  _ref = require('./util'), pow2 = _ref.pow2, rshift = _ref.rshift, twos_compl_inv = _ref.twos_compl_inv;

  CharMap = (function() {
    function CharMap(s, pad) {
      var c, i, _i, _j, _len, _len1;
      if (pad == null) {
        pad = "";
      }
      this.fwd = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = s.length; _i < _len; _i++) {
          c = s[_i];
          _results.push(c);
        }
        return _results;
      })();
      this.rev = {};
      for (i = _i = 0, _len = s.length; _i < _len; i = ++_i) {
        c = s[i];
        this.rev[c] = i;
      }
      for (_j = 0, _len1 = pad.length; _j < _len1; _j++) {
        c = pad[_j];
        this.rev[c] = 0;
      }
    }

    return CharMap;

  })();

  exports.PpBuffer = BaseBuffer = (function() {
    BaseBuffer.prototype.B16 = new CharMap("0123456789abcdef");

    BaseBuffer.prototype.B32 = new CharMap("abcdefghijkmnpqrstuvwxyz23456789");

    BaseBuffer.prototype.B64 = new CharMap("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", "=");

    BaseBuffer.prototype.B64X = new CharMap("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@_", "=");

    BaseBuffer.prototype.B64A = new CharMap("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-", "=");

    function BaseBuffer() {
      this._e = [];
      this._cp = 0;
      this._tot = 0;
    }

    BaseBuffer.prototype.get_errors = function() {
      if (this._e.length) {
        return this._e;
      } else {
        return null;
      }
    };

    BaseBuffer.prototype._prepare_encoding = function() {};

    BaseBuffer.prototype.toString = function(enc) {
      if (enc == null) {
        enc = 'base64';
      }
      this._prepare_encoding();
      switch (enc) {
        case 'buffer':
          return this.buffer_encode();
        case 'base64':
          return this.base64_encode();
        case 'base64a':
          return this.base64a_encode();
        case 'base64x':
          return this.base64x_encode();
        case 'base32':
          return this.base32_encode();
        case 'hex':
          return this.base16_encode();
        case 'binary':
          return this.binary_encode();
        case 'ui8a':
          return this.ui8a_encode();
      }
    };

    BaseBuffer.prototype.encode = function(e) {
      return this.toString(e);
    };

    BaseBuffer.prototype._get = function(i, n) {
      throw new Error("pure virtual method");
    };

    BaseBuffer.prototype.ui8a_encode = function() {
      var hold, raw;
      hold = this._cp;
      this._cp = 0;
      raw = this.read_byte_array(this._tot);
      this._cp = hold;
      return raw;
    };

    BaseBuffer.prototype.buffer_encode = function() {
      return this.ui8a_encode();
    };

    BaseBuffer.prototype.binary_encode = function() {
      var i, v;
      v = (function() {
        var _i, _ref1, _results;
        _results = [];
        for (i = _i = 0, _ref1 = this._tot; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          _results.push(this._get(i));
        }
        return _results;
      }).call(this);
      return String.fromCharCode.apply(String, v);
    };

    BaseBuffer.prototype.base16_encode = function() {
      var c, i, tmp, _i, _ref1;
      tmp = "";
      for (i = _i = 0, _ref1 = this._tot; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        c = this._get(i);
        tmp += this.B16.fwd[c >> 4];
        tmp += this.B16.fwd[c & 0xf];
      }
      return tmp;
    };

    BaseBuffer.prototype.bytes_left = function() {
      return this._tot - this._cp;
    };

    BaseBuffer.prototype.base32_encode = function() {
      var b, c, l, outlen, p, _i;
      b = [];
      l = this._tot;
      outlen = Math.floor(l / 5) * 8 + [0, 2, 4, 5, 7][l % 5];
      p = 0;
      for (c = _i = 0; _i < l; c = _i += 5) {
        b[p++] = this.B32.fwd[this._get(c) >> 3];
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0x7) << 2 | this._get(++c) >> 6];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[this._get(c) >> 1 & 0x1f];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0x1) << 4 | this._get(++c) >> 4];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0xf) << 1 | this._get(++c) >> 7];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[this._get(c) >> 2 & 0x1f];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[(this._get(c) & 0x3) << 3 | this._get(++c) >> 5];
        }
        if (p < outlen) {
          b[p++] = this.B32.fwd[this._get(c) & 0x1f];
        }
      }
      return b.slice(0, outlen).join('');
    };

    BaseBuffer.prototype.base64_encode = function() {
      return this._base64_encode(this.B64);
    };

    BaseBuffer.prototype.base64a_encode = function() {
      return this._base64_encode(this.B64A);
    };

    BaseBuffer.prototype.base64x_encode = function() {
      return this._base64_encode(this.B64X);
    };

    BaseBuffer.prototype._base64_encode = function(M) {
      var b, c, i, l, n, p, _i, _j;
      b = [];
      l = this._tot;
      c = l % 3;
      p = c > 0 ? (function() {
        var _i, _results;
        _results = [];
        for (i = _i = c; c <= 3 ? _i < 3 : _i > 3; i = c <= 3 ? ++_i : --_i) {
          _results.push('=');
        }
        return _results;
      })() : [];
      for (c = _i = 0; _i < l; c = _i += 3) {
        n = (this._get(c) << 16) + (this._get(c + 1) << 8) + this._get(c + 2);
        for (i = _j = 3; _j >= 0; i = --_j) {
          b.push(M.fwd[(n >>> i * 6) & 0x3f]);
        }
      }
      return (b.slice(0, b.length - p.length).concat(p)).join('');
    };

    BaseBuffer._decode = function(klass, s, enc) {
      var obj;
      obj = new klass;
      if ((enc == null) && typeof s === 'string') {
        return obj.base64_decode(s);
      } else {
        switch (enc) {
          case 'buffer':
            return obj.buffer_decode(s);
          case 'binary':
            return obj.binary_decode(s);
          case 'base64':
            return obj.base64_decode(s);
          case 'base64a':
            return obj.base64a_decode(s);
          case 'base64x':
            return obj.base64x_decode(s);
          case 'base32':
            return obj.base32_decode(s);
          case 'hex':
            return obj.base16_decode(s);
          case 'ui8a':
            return obj.ui8a_decode(s);
          default:
            return null;
        }
      }
    };

    BaseBuffer.prototype.buffer_decode = function(s) {
      return this.ui8a_decode(s);
    };

    BaseBuffer.prototype.binary_decode = function(b) {
      var i, _i, _ref1;
      for (i = _i = 0, _ref1 = b.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        this.push_uint8(b.charCodeAt(i));
      }
      return this;
    };

    BaseBuffer.prototype.base16_decode = function(data) {
      var c, i, last, v, _i, _len;
      if ((data.length % 2) !== 0) {
        return null;
      } else {
        last = 0;
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          c = data[i];
          if ((v = this.B16.rev[c]) == null) {
            return null;
          }
          if (i % 2 === 0) {
            last = v;
          } else {
            this.push_uint8((last << 4) | v);
          }
        }
        return this;
      }
    };

    BaseBuffer.prototype._base64_decode = function(data, M) {
      var c, i, npad, sum, v, _i, _j, _len;
      if ((data.length % 4) !== 0) {
        return null;
      } else {
        sum = 0;
        npad = 0;
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          c = data[i];
          if ((v = M.rev[c]) == null) {
            return null;
          }
          if (c === '=') {
            npad++;
          }
          sum = (sum << 6) | v;
          if (i % 4 === 3) {
            for (i = _j = 2; 2 <= npad ? _j <= npad : _j >= npad; i = 2 <= npad ? ++_j : --_j) {
              this.push_uint8((sum >> i * 8) & 0xff);
            }
            sum = 0;
          }
        }
        return this;
      }
    };

    BaseBuffer.prototype.base64_decode = function(data) {
      return this._base64_decode(data, this.B64);
    };

    BaseBuffer.prototype.base64a_decode = function(data) {
      return this._base64_decode(data, this.B64A);
    };

    BaseBuffer.prototype.base64x_decode = function(data) {
      return this._base64_decode(data, this.B64X);
    };

    BaseBuffer.prototype.base32_decode = function(data) {
      var before, c, i, j, nmb, rem, sum, v, _i, _j, _k, _l, _len, _ref1;
      sum = 0;
      for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
        c = data[i];
        if ((v = this.B32.rev[c]) == null) {
          return null;
        }
        before = sum;
        sum = (sum * 32) + v;
        if (i % 8 === 7) {
          for (j = _j = 4; _j >= 0; j = --_j) {
            this.push_uint8(rshift(sum, j * 8) & 0xff);
          }
          sum = 0;
        }
      }
      if ((rem = data.length % 8) !== 0) {
        for (i = _k = 8; 8 <= rem ? _k < rem : _k > rem; i = 8 <= rem ? ++_k : --_k) {
          sum *= 32;
        }
        if ((nmb = {
          2: 1,
          4: 2,
          5: 3,
          7: 4
        }[rem]) == null) {
          return null;
        }
        for (i = _l = 4, _ref1 = 4 - nmb; 4 <= _ref1 ? _l < _ref1 : _l > _ref1; i = 4 <= _ref1 ? ++_l : --_l) {
          this.push_uint8(rshift(sum, i * 8) & 0xff);
        }
      }
      return this;
    };

    BaseBuffer.prototype.read_bytes = function(n) {
      var i, _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        _results.push(this.read_uint8());
      }
      return _results;
    };

    return BaseBuffer;

  })();

  exports.is_uint8_array = function(x) {
    return Object.prototype.toString.call(x) === '[object Uint8Array]';
  };

}).call(this);

},{"./util":21}],19:[function(require,module,exports){
(function() {
  var CryptoJS, Prng;



  CryptoJS = require('cryptojs-1sp').CryptoJS;

  exports.Prng = Prng = (function() {
    function Prng() {}

    Prng.prototype.to_cryptojs_word_array = function(n) {
      var b, i, v;
      b = new Int32Array(n);
      window.crypto.getRandomValues(b);
      v = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = b.length; _i < _len; _i++) {
          i = b[_i];
          _results.push(i);
        }
        return _results;
      })();
      return CryptoJS.lib.WordArray.create(v);
    };

    return Prng;

  })();

  exports.prng = new Prng();

}).call(this);


},{"cryptojs-1sp":13}]},{},[1])
;