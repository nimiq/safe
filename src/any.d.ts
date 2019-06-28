// enable imports of js files without declarations
declare module '*.js';

// enable import of vue files
declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

// catch everything else that's not typed
declare module '*';
