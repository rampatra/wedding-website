;(function(exports) {
    var MS_IN_MINUTES = 60 * 1000;

    var formatTime = function(date) {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    var calculateEndTime = function(event) {
        return event.end ?
            formatTime(event.end) :
            formatTime(new Date(event.start.getTime() + (event.duration * MS_IN_MINUTES)));
    };

    var calendarGenerators = {
        google: function(event) {
            var startTime = formatTime(event.start);
            var endTime = calculateEndTime(event);

            var href = encodeURI([
                'https://www.google.com/calendar/render',
                '?action=TEMPLATE',
                '&text=' + (event.title || ''),
                '&dates=' + (startTime || ''),
                '/' + (endTime || ''),
                '&details=' + (event.description || ''),
                '&location=' + (event.address || ''),
                '&sprop=&sprop=name:'
            ].join(''));
            return '<a class="icon-google" target="_blank" href="' +
                href + '"><i class="fa fa-calendar"></i>&nbsp;&nbsp;Google naptárhoz adom</a>';
        },
    };

    var generateCalendars = function(event) {
        return {
            google: calendarGenerators.google(event),
        };
    };

    // Create CSS
    var addCSS = function() {
        if (!document.getElementById('ouical-css')) {
            document.getElementsByTagName('head')[0].appendChild(generateCSS());
        }
    };

    var generateCSS = function() {
        var styles = document.createElement('style');
        styles.id = 'ouical-css';

        styles.innerHTML = "#add-to-calendar-button{cursor:pointer}.add-to-calendar a{margin:3px}";

        return styles;
    };

    // Make sure we have the necessary event data, such as start time and event duration
    var validParams = function(params) {
        return params.data !== undefined && params.data.start !== undefined &&
            (params.data.end !== undefined || params.data.duration !== undefined);
    };

    var generateMarkup = function(calendars, clazz, calendarId) {
        var result = document.createElement('div');
        result.innerHTML = ''
        result.innerHTML += '<button type="button" data-dismiss="modal" id="add-to-calendar-button" for="btn-for-' + calendarId + '" class="btn btn-fill btn-small"><i class="fa fa-calendar"></i>&nbsp;&nbsp; Mégegyszer kitöltöm</button>';
        result.innerHTML += '<p></p>';
        Object.keys(calendars).forEach(function(services) {
            result.innerHTML += calendars[services];
        });

        result.className = 'add-to-calendar';
        if (clazz !== undefined) {
            result.className += (' ' + clazz);
        }

        addCSS();

        result.id = calendarId;
        return result;
    };

    var getClass = function(params) {
        if (params.options && params.options.class) {
            return params.options.class;
        }
    };

    var getOrGenerateCalendarId = function(params) {
        return params.options && params.options.id ?
            params.options.id :
            Math.floor(Math.random() * 1000000); // Generate a 6-digit random ID
    };

    exports.createCalendar = function(params) {
        if (!validParams(params)) {
            console.log('Event details missing.');
            return;
        }

        return generateMarkup(generateCalendars(params.data),
            getClass(params),
            getOrGenerateCalendarId(params));
    };
})(this);