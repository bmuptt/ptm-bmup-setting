<?php

namespace App\Services;

class HtmlSanitizerService
{
    /**
     * Allowed HTML tags for WYSIWYG content
     */
    private const ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img'
    ];

    /**
     * Allowed attributes for HTML tags
     */
    private const ALLOWED_ATTRIBUTES = [
        'style' => ['color', 'background-color', 'font-size', 'font-weight', 'text-align', 'text-decoration'],
        'href' => [],
        'src' => [],
        'alt' => [],
        'title' => [],
        'class' => [],
        'id' => []
    ];

    /**
     * Sanitize HTML content for WYSIWYG editor
     *
     * @param string $html
     * @return string
     */
    public function sanitize(string $html): string
    {
        if (empty($html)) {
            return $html;
        }

        // If the content doesn't contain any HTML tags, return as-is
        if (!preg_match('/<[^>]+>/', $html)) {
            return $html;
        }

        // First, remove dangerous content before stripping tags
        $html = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $html);
        $html = preg_replace('/javascript:/i', '', $html);
        $html = preg_replace('/on\w+\s*=/i', '', $html);
        
        // Then strip all tags except allowed ones
        $allowedTagsString = '<' . implode('><', self::ALLOWED_TAGS) . '>';
        $html = strip_tags($html, $allowedTagsString);

        // Parse HTML and validate attributes
        $dom = new \DOMDocument();
        
        // Suppress errors for malformed HTML
        libxml_use_internal_errors(true);
        
        // Wrap in a div to handle multiple root elements
        $wrappedHtml = '<div>' . $html . '</div>';
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $wrappedHtml, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        
        // Clear libxml errors
        libxml_clear_errors();
        
        $xpath = new \DOMXPath($dom);
        
        // Remove any script tags that might have been missed
        $scripts = $xpath->query('//script');
        foreach ($scripts as $script) {
            $script->parentNode->removeChild($script);
        }

        // Validate and clean attributes
        $this->cleanAttributes($dom);

        // Get the cleaned HTML
        $cleanedHtml = $dom->saveHTML();
        
        // Remove the XML declaration and wrapper div
        $cleanedHtml = preg_replace('/^<\?xml[^>]*\?>/', '', $cleanedHtml);
        $cleanedHtml = preg_replace('/^<div>(.*)<\/div>$/s', '$1', $cleanedHtml);
        
        return trim($cleanedHtml);
    }

    /**
     * Clean and validate attributes of HTML elements
     *
     * @param \DOMDocument $dom
     * @return void
     */
    private function cleanAttributes(\DOMDocument $dom): void
    {
        $xpath = new \DOMXPath($dom);
        $nodes = $xpath->query('//*[@*]');

        foreach ($nodes as $node) {
            $attributesToRemove = [];
            
            foreach ($node->attributes as $attribute) {
                $attrName = $attribute->name;
                $attrValue = $attribute->value;
                
                // Check if attribute is allowed
                if (!isset(self::ALLOWED_ATTRIBUTES[$attrName])) {
                    $attributesToRemove[] = $attrName;
                    continue;
                }
                
                // Special handling for style attribute
                if ($attrName === 'style') {
                    $cleanedStyle = $this->cleanStyleAttribute($attrValue);
                    if (empty($cleanedStyle)) {
                        $attributesToRemove[] = $attrName;
                    } else {
                        /** @var \DOMElement $node */
                        $node->setAttribute($attrName, $cleanedStyle);
                    }
                }
                
                // Validate href attribute (only allow http/https/mailto)
                if ($attrName === 'href') {
                    if (!$this->isValidUrl($attrValue)) {
                        $attributesToRemove[] = $attrName;
                    }
                }
                
                // Validate src attribute (only allow http/https)
                if ($attrName === 'src') {
                    if (!$this->isValidUrl($attrValue)) {
                        $attributesToRemove[] = $attrName;
                    }
                }
            }
            
            // Remove invalid attributes
            foreach ($attributesToRemove as $attrName) {
                /** @var \DOMElement $node */
                $node->removeAttribute($attrName);
            }
        }
    }

    /**
     * Clean style attribute to only allow safe CSS properties
     *
     * @param string $style
     * @return string
     */
    private function cleanStyleAttribute(string $style): string
    {
        $allowedProperties = self::ALLOWED_ATTRIBUTES['style'];
        $cleanedStyles = [];
        
        // Parse CSS properties
        $styles = explode(';', $style);
        
        foreach ($styles as $styleRule) {
            $styleRule = trim($styleRule);
            if (empty($styleRule)) {
                continue;
            }
            
            $parts = explode(':', $styleRule, 2);
            if (count($parts) !== 2) {
                continue;
            }
            
            $property = trim($parts[0]);
            $value = trim($parts[1]);
            
            // Check if property is allowed
            if (in_array($property, $allowedProperties)) {
                // Additional validation for color values
                if (in_array($property, ['color', 'background-color'])) {
                    if ($this->isValidColorValue($value)) {
                        $cleanedStyles[] = $property . ': ' . $value;
                    }
                } else {
                    $cleanedStyles[] = $property . ': ' . $value;
                }
            }
        }
        
        return implode('; ', $cleanedStyles);
    }

    /**
     * Validate if a value is a valid color
     *
     * @param string $value
     * @return bool
     */
    private function isValidColorValue(string $value): bool
    {
        // Allow hex colors (#RRGGBB or #RGB)
        if (preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', $value)) {
            return true;
        }
        
        // Allow rgb/rgba colors
        if (preg_match('/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/', $value)) {
            return true;
        }
        
        // Allow named colors (basic set)
        $namedColors = [
            'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
            'pink', 'brown', 'gray', 'grey', 'lightblue', 'lightgreen', 'lightgray',
            'darkblue', 'darkgreen', 'darkgray', 'transparent'
        ];
        
        return in_array(strtolower($value), $namedColors);
    }

    /**
     * Validate if a URL is safe
     *
     * @param string $url
     * @return bool
     */
    private function isValidUrl(string $url): bool
    {
        // Allow relative URLs
        if (strpos($url, '/') === 0) {
            return true;
        }
        
        // Allow http/https URLs
        if (preg_match('/^https?:\/\//', $url)) {
            return true;
        }
        
        // Allow mailto URLs
        if (strpos($url, 'mailto:') === 0) {
            return true;
        }
        
        return false;
    }
}
