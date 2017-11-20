<x:stylesheet version="1.0" xmlns:x="http://www.w3.org/1999/XSL/Transform" xmlns:ext="http://exslt.org/common">
    <x:output method="html" encoding="utf-8" indent="yes" />
    <!-- Hack to fix doctype to be HTML5  -->
    <x:template match="processing-instruction('xml-stylesheet')">
        <x:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;&#xd;</x:text>
    </x:template>
    <!-- Hack to fix paths of imports to be relative. Usage: document('some-import.xml', $rootPath) -->
    <x:variable name="rootPath" select="app"></x:variable>
    <!-- App Template - the starting point -->
    <x:template match="app">
        <!-- Recurse through all imports -->
        <x:variable name="pass1Result">
            <x:apply-templates select="node()|@*" />
        </x:variable>
        <x:element name="html">
            <!-- Filter Head -->
            <x:element name="head">
                <x:copy-of select="ext:node-set($pass1Result)/x-head/node()" />
                <!-- Filter Styles -->
                <x:element name="style">
                    <x:apply-templates select="ext:node-set($pass1Result)" mode="passStyles" />
                </x:element>
            </x:element>
            <!-- Filter DOMs -->
            <x:apply-templates select="ext:node-set($pass1Result)" mode="passDOMs" />
            <!-- Filter Scripts -->
            <x:element name="script">
                <x:apply-templates select="ext:node-set($pass1Result)" mode="passScripts" />
            </x:element>
        </x:element>
    </x:template>
    <!-- Element Recursion -->
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
    <!-- DOM filter -->
    <x:template mode="passDOMs" match="node()|@*">
        <x:copy>
            <x:apply-templates mode="passDOMs" select="node()|@*" />
        </x:copy>
    </x:template>
    <x:template mode="passDOMs" match="script"></x:template>
    <x:template mode="passDOMs" match="style"></x:template>
    <x:template mode="passDOMs" match="x-head"></x:template>
    <!-- Script filter -->
    <x:template mode="passScripts" match="/">
        <x:variable name="passScriptsResult">
            <x:apply-templates mode="passScripts1" select="node()|@*" />
        </x:variable>
        <x:apply-templates mode="passScripts2" select="ext:node-set($passScriptsResult)" />
    </x:template>
    <!-- Script filter pass 1 -->
    <x:template mode="passScripts1" match="node()|@*">
        <x:apply-templates mode="passScripts1" select="node()|@*" />
    </x:template>
    <x:template mode="passScripts1" match="script">
        <x:copy-of select="."></x:copy-of>
    </x:template>
    <!-- Script filter pass 2 -->
    <x:key name="myKey" match="script/node()" use="." />
    <x:template mode="passScripts2" match="/">
        <x:for-each select="script/node()[generate-id() = generate-id(key('myKey',.)[1])]">
            <x:value select="'/* script*/'"></x:value>
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
    <!-- Style filter pass 1 -->
    <x:template mode="passStyles1" match="node()|@*">
        <x:apply-templates mode="passStyles1" select="node()|@*" />
    </x:template>
    <x:template mode="passStyles1" match="style">
        <x:copy-of select="."></x:copy-of>
    </x:template>
    <!-- Style filter pass 2 -->
    <x:key name="myKey" match="style/node()" use="." />
    <x:template mode="passStyles2" match="/">
        <x:for-each select="style/node()[generate-id() = generate-id(key('myKey',.)[1])]">
            <x:value select="'/* style*/'"></x:value>
            <x:copy-of select="." />
            <x:text>&#xd;</x:text>
        </x:for-each>
    </x:template>
</x:stylesheet>