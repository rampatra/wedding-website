jQuery(function($){

    var Formoid = (function(){
    
        var API_URL = ('https:' == location.protocol ? 'https:' : 'http:') + '//formoid.net/api/push';
        
        var $ajax = (function(){
            var ie = (/MSIE (\d+)\./.exec(navigator.userAgent) || [0, 0])[1];
            if (8 == ie || (9 == ie && 'file:' != location.protocol)){
                return function(url, settings){
                    var xdr = new XDomainRequest(), defer = $.Deferred();
                    xdr.open(settings.type, url);
                    xdr.onload = function(){ defer.resolve(this.responseText); };
                    xdr.onerror = function(){ defer.reject(); };
                    xdr.send(settings.data);
                    return defer;
                };
            } else {
                $.support.cors = true;
                return $.ajax;
            }
        })();
    
        var prop = function(name, args){
            name = '__' + name + '__';
            if (args.length){
                this[name] = args[0];
                return this;
            }
            return this[name];
        };
    
        var attachMethods = function(obj, context, methods){
            $.each(methods, function(i, method){
                obj[method] = function(){
                    return context[method].apply(context, arguments);
                };
            });
            return obj;
        };
    
        var Form = function(settings){
            settings = settings || {};
            this.__email__ = settings.email || '';
            this.__title__ = settings.title || '';
            this.__data__  = settings.data  || [];
        };
    
        Form.prototype.email = function(value){
            return prop.call(this, 'email', arguments);
        };
    
        Form.prototype.title = function(value){
            return prop.call(this, 'title', arguments);
        };
    
        Form.prototype.data = function(value){
            return prop.call(this, 'data', arguments);
        };
    
        Form.prototype.send = function(data, beforeStart){
            var defer = attachMethods($.Deferred(), this, ['email', 'title', 'data', 'send']);
            if (beforeStart){
                beforeStart.call(this, defer);
                if ('pending' != defer.state())
                    return defer;
            }
            $ajax(API_URL, {
                type : 'POST',
                data : JSON.stringify({
                    email : this.__email__,
                    form : {
                        title : this.__title__,
                        data : (arguments.length ? data : this.__data__)
                    }
                })
            }).done(function(responseText){
                try {
                    var data = JSON.parse(responseText);
                    if (data.error) defer.reject(data.error);
                    else defer.resolve(data.response);
                } catch (e) {
                    defer.reject('Incorrect server response.');
                }
            }).fail(function(){
                var error = 'Failed to query the server. ';
                if ('onLine' in navigator && !navigator.onLine)
                    error += 'No connection to the Internet.';
                else error += 'Check the connection and try again.';
                defer.reject(error);
            });
            return defer;
        };
    
        return {
            Form : function(settings){
                return new Form(settings);
            }
        }
    
    })();

    var isValid = function(input){
        if (input.checkValidity) return input.checkValidity(); // native validation
        var isValid = true, value = $(input).val(), type = $(input).attr('type');
        // regexp rules from https://github.com/running-coder/jquery-form-validation
        if (value) isValid = !('email' === type && !/^([^@]+?)@(([a-z0-9]-*)*[a-z0-9]+\.)+([a-z0-9]+)$/i.test(value));
        else if ($(input).attr('required')) isValid = false;
        $(input)[ (isValid ? 'remove' : 'add') + 'Class' ]('form-invalid');
        return isValid;
    };

    $('[data-form-type="formoid"]').each(function(){
        var form,
            $this   = $(this),
            $form   = $this.is('form') ? $this : $this.find('form'),
            $alert  = $this.find('[data-form-alert]'),
            $title  = $this.is('[data-form-title]') ? $this : $this.find('[data-form-title]'),
            $submit = $this.find('[type="submit"]'),
            alertSuccess = $alert.html();
        $submit
            .click(function(){ $form.addClass('form-active'); });
        $form.submit(function(event){
            event.preventDefault();
            $form.addClass('form-active');
            if ($submit.hasClass('btn-loading')) return;
            var isValidForm = true, data = [];
            form = form || Formoid.Form({
                email : $this.find('[data-form-email]').val(),
                title : $title.attr('data-form-title') || $title.text()
            });
            $alert.html('');
            $this.find('[data-form-field]').each(function(){
                if (!isValid(this))
                    isValidForm = false;
                data.push([
                    $(this).attr('data-form-field') || $(this).attr('name'),
                    $(this).val()
                ]);
            });
            if (!isValidForm) return;
            $submit.addClass('btn-loading').prop('disabled', true);
            form.send(data).done(function(message){
                $form.removeClass('form-active');
                $this.find('[data-form-field]').val('');
                $alert.removeAttr('hidden');
                $alert.append($('<div class="alert alert-form alert-success text-xs-center"/>').text(alertSuccess || message));
            }).fail(function(error){
                $alert.append($('<div class="alert alert-form alert-danger text-xs-center"/>').text(error));
            }).always(function(){
                $submit.removeClass('btn-loading').prop('disabled', false);
            });
        });
    });

});