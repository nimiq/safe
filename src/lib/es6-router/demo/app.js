import Router from '../src/index.js';

class Demo {
    constructor() {
        const router = new Router()
            .add(/about/, () => {
                console.log('about');
            })
            .add(/test\/{param1}\/{param2}/, (param1, param2) => {
                console.log(`reached "test" with params ${param1} and ${param2}`);
            })
            .add(() => {
                console.log('home page');
            });

        const json = JSON.stringify({ a: "abc", b:0, c: [0, 1], d: { e: 0 }});
        router.navigate(`test/${json}/foo`);
    }
}

window.demo = new Demo();
