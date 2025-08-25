Images automagically compressed by [Calibre](https://calibreapp.com)'s [image-actions](https://github.com/marketplace/actions/image-actions) ✨

Compression reduced images by <strong><%- overallPercentageSaved %>%</strong>, saving <strong><%- overallBytesSaved %></strong>.

<% if(showSummary) { -%>
**Displaying top 25 most improved images. <%- totalOptimisedCount %> images processed.**

<% } -%>
| Filename | Before | After | Improvement | Visual comparison |
| -------- | ------ | ----- | ----------- | ----------------- |
<% optimisedImages.forEach((image) => { -%>
| <code><%- image.name %></code> | <%- image.formattedBeforeStats %> | <%- image.formattedAfterStats %> | <%- image.formattedPercentChange %> | [View diff](<%- image.diffUrl %>) |
<% }); %>

<% if(unoptimisedImages.length) { -%>
<%- unoptimisedImages.length %> <%- unoptimisedImages.length > 1 ? 'images' : 'image' %> did not require optimisation.
<% } -%>
