# x-element.js

An ultra lightweight JavaScript frontend framework for Progressive Web Apps.

## Using x-elements

X-elements are custom tags that become part of your HTML markup and expose special features and functionality, like little widgets but also complex layouts and user interface elements. You can create x-elements or reuse x-elements of others. The markup is just like regular HTML tags, but to make sure HTML tags are not named the same, x-elements usually have an "x" in front of it (recommended, not required). So you're going to write plain HTML markup and hide all the extra functionality in a package associated with that x-element. This approach makes your app super modular, and modules are reusable in other apps.

## x-element API
Each x-element comes with the fundamental functionality: creating an element, finding elements, and handling events.

Method                           | Parameters   | Return               | Description
---------------------------------|--------------|----------------------|-----------------------
createElement                    | none         | DOM element          | Creates and returns a DOM element for this x-element. The DOM element needs to be added to the DOM. Usually the x-app will take care of this.
$(selector)                      | CSS selector | DOM element          | First DOM element within this x-element's children that matches the CSS selector
$$(selector)                     | CSS selector | List of DOM elements | A list of all DOM elements with this x-element matching the given CSS selector
clear                            | none         | nothing              | Removes all the DOM elements within this x-element, effectively clearing it.
addEventListener(type, callback) | name/type of event and callback | nothing | Links the callback method to the given event type, thus calling the callback whenever the respective event is triggered on this element.
fire(type, detail=null, bubbles=true) | type of event, additional information, bubble mode enabled | nothing | Fires (i.e. sends out) a new event of the given type starting from this element. The detail will be attached to the event object, so any callback method can see and use this information. When bubbling mode is on, the event will be passed on to the parent element if not handled by event listeners of this element (see [MDN's page on events for an in-depth explanation with examples](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events)).


## Creating your own x-elements

X-Elements are defined by Javascript and then added to a web app as a tag following a simple camel-case to dash-case convention, that means your `XMyElement` class will become `<x-my-element/>` in your HTML. In the `XMyElement` class you can add all the functionality you need for your element while using also the [features of the underlying x-element](#x-element-api).

Here is the basic structure of a new x-element:

```javascript
class XMyElement extends XElement { // extend XElement of course
  onCreate() {
    // do something to initialize your new <my-element>
  }

  // optional; a list of all the x-elements used within your x-element
  children() {
    return [
      XSomeOtherElement,
      // ... add all child x-elements here
    ]
  }

  // optional; instead of putting all the x-elements in your page,
  // you can return a kind of template here, or even generate it with a script
  html(){
    // note the <section content> element here, it will be filled with the HTML content of your
    // x-element inside of the HTML page; details below
    return `
    <x-some-other-element>
      <a href="#about">About page</a>
    </x-some-other-element>
    <section content/>
    <section>
      footer
    </section>

}
```

*Note:* it's recommended to add "x" in front of your custom x-element's name to make sure the names are not the same as existing or future HTML tags. Let's call a convention. And the x-element's name is like a local ID. So x-elements can only be used once within the same container (which is an x-element again). But you can reuse x-elements in different places of your app of course.

In the example below, our x-element `<x-my-element>` has HTML inside. So if the `XMyElement` class has a `html` method defining a tag marked `content` (see code above), this HTML will be kept safe, then the template will be put inside and finally the kept HTML will put inside the tag marked with `content`.

```html
<body>
  <x-my-element>
    <div>some HTML content</div>
  </x-my-element>
</body>
```

So the result from the previous two code examples will be:

```html
<body>
  <x-my-element>
    <x-some-other-element>
      <a href="#about">About page</a>
    </x-some-other-element>
    <section/>
      <div>some HTML content</div>
    </section>
    <section>
      footer
    </section>
  </x-my-element>
</body>
```

*Note:* The `content` marker will be removed once the HTML has been inserted (cf. example above).

## More

### Examples

Check out the [Nimiq wallet app's source code](https://github.com/nimiq/wallet) app to see x-element in action and the [x-elements of the Nimiq ecosystem](https://github.com/nimiq/nimiq-elements) to get inspired.

### License
X-element is based on ES6 and licensed under the [MIT license](./LICENSE).
