MiracleBush
====

### Javascript framework for creating visual components library.

Visit project page: http://miraclebush.vladimirkalmykov.com/

## Getting Started

I. Get lasted compiled version on http://miraclebush.vladimirkalmykov.com/downloads.

II. Include mb.pack.js on your web-site:
```html
<script language="javascript" src="js/mb.pack.js"></script>
```
III. Create new .js file with your own project name, for example myown.mb-lib.js, and css file myown.mb-lib.ccs:

```html
<script language="javascript" src="js/myown.mb-lib.js"></script>
<link rel="stylesheet" href="css/myown.mb-lib.css" />
```

V. Initial your own UI library in myown.mb-lib.js and create widget(s):
```javascript
$bush.ui("myown") // Your UI library just created
/* UI: Wide message panel*/
.widget('message', function(el) {
  // use jQuery or any tool you like
  var mp=$(el).html().split('@');
  $(el).html('<strong>'+mp[0]+': </strong><span>'+mp[1]+'</span>');
});
```
VI. Set style to your widget:
```css
[ui-myown=message] {
    border-radius: 6px;
    background-color: rgb(226, 230, 215);
    font-size: 14px;
    padding: 12px;
    margin: 0 0 2px 0;
}

[ui-myown=message] > strong {
    color:#363C2C;
}

[ui-myown=message] > span {
    font-style:italic;   
}
```
VII. Use it via html:
```html
<p ui-myown="message">Me@Hello, world</p>
<p ui-myown="message">World@Hi</p>
```
Test it on jsfiddle: http://jsfiddle.net/Morulus/8THWn/
