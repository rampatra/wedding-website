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
                href + '">Google Calendar</a>';
        },

        yahoo: function(event) {
            var eventDuration = event.end ?
                ((event.end.getTime() - event.start.getTime())/ MS_IN_MINUTES) :
                event.duration;

            // Yahoo dates are crazy, we need to convert the duration from minutes to hh:mm
            var yahooHourDuration = eventDuration < 600 ?
                '0' + Math.floor((eventDuration / 60)) :
                Math.floor((eventDuration / 60)) + '';

            var yahooMinuteDuration = eventDuration % 60 < 10 ?
                '0' + eventDuration % 60 :
                eventDuration % 60 + '';

            var yahooEventDuration = yahooHourDuration + yahooMinuteDuration;

            // Remove timezone from event time
            var st = formatTime(new Date(event.start - (event.start.getTimezoneOffset() *
                MS_IN_MINUTES))) || '';

            var href = encodeURI([
                'http://calendar.yahoo.com/?v=60&view=d&type=20',
                '&title=' + (event.title || ''),
                '&st=' + st,
                '&dur=' + (yahooEventDuration || ''),
                '&desc=' + (event.description || ''),
                '&in_loc=' + (event.address || '')
            ].join(''));

            return '<a class="icon-yahoo" target="_blank" href="' +
                href + '">Yahoo! Calendar</a>';
        },

        ics: function(event, eClass, calendarName) {
            var startTime = formatTime(event.start);
            var endTime = calculateEndTime(event);

            var href = encodeURI(
                'data:text/calendar;charset=utf8,' + [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'BEGIN:VEVENT',
                    'URL:' + document.URL,
                    'DTSTART:' + (startTime || ''),
                    'DTEND:' + (endTime || ''),
                    'SUMMARY:' + (event.title || ''),
                    'DESCRIPTION:' + (event.description || ''),
                    'LOCATION:' + (event.address || ''),
                    'END:VEVENT',
                    'END:VCALENDAR'].join('\n'));

            return '<a class="' + eClass + '" target="_blank" href="' +
                href + '">' + calendarName + ' Calendar</a>';
        },

        ical: function(event) {
            return this.ics(event, 'icon-ical', 'iCal');
        },

        outlook: function(event) {
            return this.ics(event, 'icon-outlook', 'Outlook');
        }
    };

    var generateCalendars = function(event) {
        return {
            google: calendarGenerators.google(event),
            yahoo: calendarGenerators.yahoo(event),
            ical: calendarGenerators.ical(event),
            outlook: calendarGenerators.outlook(event)
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

        styles.innerHTML = "#add-to-calendar-label{margin-bottom:10px;cursor:pointer}.add-to-calendar a{margin:3px}.add-to-calendar-checkbox~a{display:none}.add-to-calendar-checkbox:checked~a{display:block;}input[type=checkbox].add-to-calendar-checkbox{display:none}";

        return styles;
    };

    // Make sure we have the necessary event data, such as start time and event duration
    var validParams = function(params) {
        return params.data !== undefined && params.data.start !== undefined &&
            (params.data.end !== undefined || params.data.duration !== undefined);
    };

    var generateMarkup = function(calendars, clazz, calendarId) {
        var result = document.createElement('div');

        result.innerHTML = '<label id="add-to-calendar-label" for="checkbox-for-' +
            calendarId + '" class="btn btn-fill btn-small"><i class="fa fa-calendar"></i>&nbsp;&nbsp; Add to Calendar</label>';
        result.innerHTML += '<input name="add-to-calendar-checkbox" class="add-to-calendar-checkbox" id="checkbox-for-' + calendarId + '" type="checkbox">';

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