
(function () {
    'use strict';

    if (window.__aatSessionBar) return;
    window.__aatSessionBar = true;

    var T = window.aatT || function (s) { return s; };
    var LANG = localStorage.getItem('aat_lang') || 'en';

    // Preserve the existing Fiori language handling.
    var qs = new URLSearchParams(location.search);
    var isFiori = /\/aat\.admin\./.test(location.pathname);

    if (isFiori) {
        if (LANG === 'hi' && qs.get('sap-ui-language') !== 'hi') {
            qs.set('sap-ui-language', 'hi');
            location.replace(
                location.pathname + '?' + qs.toString() + location.hash
            );
            return;
        }

        if (LANG !== 'hi' && qs.has('sap-ui-language')) {
            qs.delete('sap-ui-language');
            var rest = qs.toString();

            location.replace(
                location.pathname +
                (rest ? '?' + rest : '') +
                location.hash
            );
            return;
        }
    }

    // Only the appearance and layout of the session bar are changed.
    var style = document.createElement('style');

    style.textContent = `
        #aat-bar {
            position: fixed;
            top: 12px;
            right: 24px;
            z-index: 100000;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            padding: 0;
            background: transparent;
            border: none;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 13px;
        }

        #aat-bar,
        #aat-bar * {
            box-sizing: border-box;
        }

        #aat-bar .pill {
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 100%;
            padding: 7px 13px;
            border: 1px solid #355B48;
            border-radius: 12px;
            background: #355B48;
            color: #FFFFFF;
            box-shadow: 0 3px 8px rgba(37, 67, 51, 0.12);
            cursor: pointer;
            font: inherit;
            font-weight: 600;
            transition: background 0.2s, border-color 0.2s;
        }

        #aat-bar .pill:hover {
            background: #254333;
            border-color: #254333;
        }

        #aat-bar .profile-icon {
            width: 30px;
            height: 30px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            border-radius: 9px;
            background: #DCE8D9;
            color: #254333;
            font-size: 15px;
        }

        #aat-bar .profile-name {
            overflow-wrap: anywhere;
        }

        #aat-bar .chevron {
            flex-shrink: 0;
            font-size: 11px;
            transition: transform 0.2s;
        }

        #aat-bar .pill[aria-expanded="true"] .chevron {
            transform: rotate(180deg);
        }

        /*
         * The menu stays in normal document flow.
         * Opening it expands this row and pushes page content down.
         */
        #aat-menu {
            display: none;
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 300px;
            max-width: 100%;
            margin-top: 10px;
            padding: 8px;
            border: 1px solid #E2E8DE;
            border-radius: 16px;
            background: #FFFEFA;
            color: #26372D;
            box-shadow: 0 8px 22px rgba(37, 67, 51, 0.10);
            overflow: hidden;
        }

        #aat-menu.open {
            display: block;
        }

        #aat-menu .who {
            padding: 11px 10px 13px;
            margin-bottom: 6px;
            border-bottom: 1px solid #E8ECE4;
            overflow-wrap: anywhere;
        }

        #aat-menu .who small {
            display: block;
            margin-bottom: 5px;
            color: #78847A;
            font-size: 11px;
        }

        #aat-menu .who-email {
            font-size: 12px;
            font-weight: 650;
            overflow-wrap: anywhere;
        }

        #aat-menu .roles {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 8px;
        }

        #aat-menu .role {
            display: inline-block;
            padding: 4px 9px;
            border-radius: 20px;
            background: #E8F0E5;
            color: #355B48;
            font-size: 11px;
            font-weight: 600;
        }

        #aat-menu a {
            display: flex;
            align-items: center;
            gap: 11px;
            min-height: 42px;
            padding: 10px;
            border-radius: 9px;
            color: #35483A;
            text-decoration: none;
            cursor: pointer;
            overflow-wrap: anywhere;
        }

        #aat-menu a:hover,
        #aat-menu a:focus-visible {
            background: #EAF1E7;
            color: #254333;
            outline: none;
        }

        #aat-menu .menu-icon {
            width: 22px;
            flex-shrink: 0;
            text-align: center;
            font-size: 16px;
        }

        #aat-menu .menu-divider {
            height: 1px;
            margin: 7px 3px;
            border: 0;
            background: #E8ECE4;
        }

        #aat-menu a.switch-link {
            background: #F0F4EC;
            color: #355B48;
            font-weight: 650;
        }

        #aat-menu a.switch-link:hover {
            background: #DCE8D9;
        }

        #aat-menu a.logout-link {
            color: #A14E43;
        }

        #aat-menu a.logout-link:hover {
            background: #F9EDE9;
        }

        @media (max-width: 600px) {
            #aat-bar {
                padding: 10px 12px;
            }

            #aat-menu {
                width: min(300px, 100%);
            }
        }
    `;

    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'aat-bar';

    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill';
    pill.setAttribute('aria-haspopup', 'true');
    pill.setAttribute('aria-expanded', 'false');

    var menu = document.createElement('div');
    menu.id = 'aat-menu';

    bar.appendChild(pill);
    bar.appendChild(menu);

    function link(text, href, className, onclick, icon) {
        var a = document.createElement('a');
        a.textContent = '';
        a.href = href || '#';

        if (className) a.className = className;

        var iconEl = document.createElement('span');
        iconEl.className = 'menu-icon';
        iconEl.textContent = icon || '';

        var label = document.createElement('span');
        label.textContent = text;

        a.append(iconEl, label);

        if (onclick) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                onclick();
            });
        }

        return a;
    }

    function addDivider() {
        var divider = document.createElement('div');
        divider.className = 'menu-divider';
        divider.setAttribute('role', 'separator');
        menu.appendChild(divider);
    }

    function closeMenu() {
        menu.classList.remove('open');
        pill.setAttribute('aria-expanded', 'false');
    }

    function toggleLanguage() {
        localStorage.setItem('aat_lang', LANG === 'hi' ? 'en' : 'hi');
        location.reload();
    }

    function languageLink() {
        return link(
            LANG === 'hi' ? 'English' : 'हिन्दी',
            '#',
            '',
            toggleLanguage,
            '🌐'
        );
    }

    function render(me, dev) {
        var roles = [];

        if (me.isAdmin) roles.push(T('Admin'));
        if (me.isUser) roles.push(T('Adopter'));

        // Preserve the existing account and role information.
        pill.replaceChildren();

        var profileIcon = document.createElement('span');
        profileIcon.className = 'profile-icon';
        profileIcon.textContent = '👤';

        var profileName = document.createElement('span');
        profileName.className = 'profile-name';
        profileName.textContent =
            String(me.id).split('@')[0] + ' · ' +
            (roles.join(' / ') || T('no role'));

        var chevron = document.createElement('span');
        chevron.className = 'chevron';
        chevron.textContent = '▾';

        pill.append(profileIcon, profileName, chevron);

        pill.onclick = function (e) {
            e.stopPropagation();

            var isOpen = menu.classList.toggle('open');
            pill.setAttribute('aria-expanded', String(isOpen));
        };

        menu.replaceChildren();

        var who = document.createElement('div');
        who.className = 'who';

        var small = document.createElement('small');
        small.textContent = T('Signed in as');
        who.appendChild(small);

        var email = document.createElement('div');
        email.className = 'who-email';
        email.textContent = me.id;
        who.appendChild(email);

        var roleList = document.createElement('div');
        roleList.className = 'roles';

        roles.forEach(function (role) {
            var badge = document.createElement('span');
            badge.className = 'role';
            badge.textContent = role;
            roleList.appendChild(badge);
        });

        who.appendChild(roleList);
        menu.appendChild(who);

        menu.appendChild(
            link(T('Home'), '/landing/index.html', '', null, '🏠')
        );

        if (me.isAdmin) {
            menu.appendChild(
                link(
                    T('Admin dashboard'),
                    '/dashboard/index.html',
                    '',
                    null,
                    '📊'
                )
            );
        }

        if (me.isUser) {
            menu.appendChild(
                link(
                    T('Adopter portal'),
                    '/portal/index.html',
                    '',
                    null,
                    '🐾'
                )
            );
        }

        addDivider();
        menu.appendChild(languageLink());

        menu.appendChild(
            link(
                T('Switch user / role'),
                dev ? '/switch/index.html' : '/logout',
                'switch-link',
                null,
                '🔁'
            )
        );

        menu.appendChild(
            link(T('Sign out'), '/logout', 'logout-link', null, '🚪')
        );
    }

    function renderSignedOut(dev) {
        pill.replaceChildren();

        var icon = document.createElement('span');
        icon.className = 'profile-icon';
        icon.textContent = '🔑';

        var label = document.createElement('span');
        label.textContent = T('Sign in');

        pill.append(icon, label);

        pill.onclick = function () {
            location.href = dev
                ? '/switch/index.html'
                : '/landing/index.html';
        };

        menu.replaceChildren();
    }

    // Preserve the existing session and development-login checks.
    function load() {
        fetch('/dev/users', { credentials: 'same-origin' })
            .then(function (r) {
                return r.ok;
            }, function () {
                return false;
            })
            .then(function (dev) {
                fetch('/odata/v4/session/me()', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin'
                })
                    .then(function (r) {
                        return r.ok ? r.json() : Promise.reject(r.status);
                    })
                    .then(function (me) {
                        render(me, dev);
                    })
                    .catch(function () {
                        renderSignedOut(dev);
                    });
            });
    }

    document.addEventListener('click', function (e) {
        if (!bar.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    function mount() {
        // Give the control its own row before the page content.
        document.body.insertBefore(bar, document.body.firstChild);
        load();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
