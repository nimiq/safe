<x:stylesheet version="1.0" xmlns:x="http://www.w3.org/1999/XSL/Transform" xmlns:ext="http://exslt.org/common">
    <!-- Set doctype to HTML5 (See: https://stackoverflow.com/questions/3387127/set-html5-doctype-with-xslt) -->
    <x:output method="html" encoding="utf-8" indent="yes" doctype-system="about:legacy-compat"/>
    <!-- Remove stylesheet ref from output (See: https://stackoverflow.com/questions/28634556/xslt-remove-sources-stylesheet) -->
    <x:template match="processing-instruction('xml-stylesheet')"></x:template>
    <!-- Hack to fix paths of imports to be relative to /index.xhtml; Usage: document('some-import.xml', $rootPath) -->
    <x:variable name="rootPath" select="app"></x:variable>
    <!-- App Template - the starting point -->
    <x:template match="app">
        <!-- Recurse through all imports -->
        <x:variable name="pass1Result">
            <x:apply-templates select="node()|@*" />
        </x:variable>
        <x:element name="html">
            <!-- Filter head tag -->
            <x:element name="head">
                <x:copy-of select="ext:node-set($pass1Result)/x-head/node()" />
                <!-- Filter for Styles -->
                <x:element name="style">
                    <x:apply-templates select="ext:node-set($pass1Result)" mode="passStyles" />
                </x:element>
            </x:element>
            <!-- Filter for DOM Elements -->
            <x:apply-templates select="ext:node-set($pass1Result)" mode="passDOMs" />
            <!-- Filter for Scripts -->
            <x:element name="script">
                <x:attribute name="async">1</x:attribute>
                <x:apply-templates select="ext:node-set($pass1Result)" mode="passScripts" />
            </x:element>
        </x:element>
    </x:template>
    <!-- Imports (find every "x-some-element" and copy the contents of the "x-some-element.xml" file, then recurse.) -->
    <x:template match="node()|@*">
        <x:copy>
            <x:apply-templates select="node()|@*" />
        </x:copy>
    </x:template>
    <x:template match="*[starts-with(name(), 'view-') or starts-with(name(), 'x-')]">
        <x:copy>
            <x:apply-templates select="document(concat('elements/',name(),'.xhtml'),$rootPath)/*/*"></x:apply-templates>
            <x:apply-templates></x:apply-templates>
        </x:copy>
    </x:template>
    <!-- DOM Element filter: (remove all script, style and x-head elements) -->
    <x:template mode="passDOMs" match="node()|@*">
        <x:copy>
            <x:apply-templates mode="passDOMs" select="node()|@*" />
        </x:copy>
    </x:template>
    <x:template mode="passDOMs" match="script|style|x-head"></x:template>
    <!-- Script filter -->
    <x:template mode="passScripts" match="/">
        <x:variable name="passScriptsResult">
            <x:apply-templates mode="passScripts1" select="node()|@*" />
        </x:variable>
        <x:apply-templates mode="passScripts2" select="ext:node-set($passScriptsResult)" />
    </x:template>
    <!-- Script filter pass 1 (collect all script elements) -->
    <x:template mode="passScripts1" match="node()|@*">
        <x:apply-templates mode="passScripts1" select="node()|@*" />
    </x:template>
    <x:template mode="passScripts1" match="script">
        <x:copy-of select="."></x:copy-of>
    </x:template>
    <!-- Script filter pass 2 (remove multiple occurences) -->
    <x:key name="scriptKey" match="script/node()" use="." />
    <x:template mode="passScripts2" match="/">
        <x:for-each select="script/node()[generate-id() = generate-id(key('scriptKey', .)[1])]">
            <!-- <x:value select="'/* script */'"></x:value> -->
            <x:copy-of select="." />
            <x:text>&#xd;</x:text>
        </x:for-each>
    </x:template>
    <!-- Style filter -->
    <x:template mode="passStyles" match="/">
        <x:variable name="passStylesResult">
            <x:apply-templates mode="passStyles1" select="node()|@*" />
        </x:variable>
        <x:apply-templates mode="passStyles2" select="ext:node-set($passStylesResult)" />
    </x:template>
    <!-- Style filter pass 1 (collect all style elements) -->
    <x:template mode="passStyles1" match="node()|@*">
        <x:apply-templates mode="passStyles1" select="node()|@*" />
    </x:template>
    <x:template mode="passStyles1" match="style">
        <x:copy-of select="."></x:copy-of>
    </x:template>
    <!-- Style filter pass 2 (remove multiple occurences) -->
    <x:key name="styleKey" match="style/node()" use="." />
    <x:template mode="passStyles2" match="/">
        <x:for-each select="style/node()[generate-id() = generate-id(key('styleKey',.)[1])]">
            <!-- <x:value select="'/* style */'"></x:value> -->
            <x:copy-of select="." />
            <x:text>&#xd;</x:text>
        </x:for-each>
    </x:template>
</x:stylesheet>