Images automagically compressed by [Calibre](https://calibreapp.com)'s [image-actions](https://github.com/marketplace/actions/image-actions) ✨

Compression reduced images by <strong><%- overallPercentageSaved %>%</strong>, saving <strong><%- overallBytesSaved %></strong>.

<% if(optimisedImages.length < 50) { -%>
| Filename | Before | After | Improvement |
| -------- | ------ | ----- | ----------- |
<% optimisedImages.forEach((image) => { -%>
| <code><%- image.name %></code> | <%- image.formattedBeforeStats %> | <%- image.formattedAfterStats %> | <%- image.formattedPercentChange %> |
<% }); %>
<% } else { %>
<%- optimisedImages.length %> images were optimised, but the list is too long to display.
<% } %>

<% if(unoptimisedImages.length) { -%>
<%- unoptimisedImages.length %> <%- unoptimisedImages.length > 1 ? 'images' : 'image' %> did not require optimisation.
<% } %>