$(document).ready(function () {
        const pageSize = 100;

        // Unified function to handle both initial load and load more on scroll
        function loadData(label) {
            console.log("function called");
            var loadState = $(label).find('.isLoading').val();
            var offset = $(label).find('.offset').val();
            var filter = $(label).find('.search').val();
            var groupId = $(label).find('.groupId').val();
            var isFull = $(label).find('.isFull').val();
            
            // If entire group data is loaded or the group data is currently being loaded
            if(isFull === 'true' || loadState === 'true')
                return
            
            // Set the loading flag to true before fetching the data
            $(label).find('.isLoading').val('true');
            
            // Call api and append the options
            $.ajax({
                url: `https://joget.abc.cde.efg/jw/api/list/list_grpEntMap?groupId=${groupId}&entitlementId=${filter}&startOffset=${offset}&pageSize=${pageSize}`,
                headers: {
                    accept: 'application/json',
                    api_id: 'API-12131-12312-1212',
                    api_key: 'oiusdoiuasdouasd'
                },
                type: 'GET',
                success: function(req) {
                    console.log(req);

                    // Build the options for the entitlement drop-down multiselect
                    const options = req.data.map(item => 
                        `<option value="${item.entitlementId}">${item.groupId} - ${item.entitlementId}</option>`
                    );

                    // Find the multiselect container for the current group
                    let multiselect = $(label).find('select');
                    
                    // Append the new options to the multiselect
                    multiselect.append(options.join(''));
                    multiselect.css('width', '100%');
                    
                    // function to disable and add the option to the cart on select
                    multiselect.on('click', 'option', function() {
                        const option = $(this);
                        if (option.prop('disabled')) return; // Do nothing if the option is disabled which means it's already selected
                    
                        // Create the option element with a cross button
                        const cartOption = $('<option>').val(option.val()).text(option.text());
                        const removeButton = $('<span class="remove fa fa-trash"></span>'); // Create the cross button
                    
                        // Append remove button to the option
                        const cartItem = $('<div class="cart-item">').append(cartOption).append(removeButton);
                    
                        // Add the Item to the cart
                        $(label).find('.cart').append(cartItem);
                    
                        // Disable the option in the multiselect
                        option.prop('disabled', true);
                    });
                    
                    // Handle removal of options from cart
                    $(label).find('.cart').on('click', '.remove', function() {
                        const cartItem = $(this).parent();
                        const optionValue = cartItem.find('option').val();
                    
                        // Remove from the cart
                        cartItem.remove();
                    
                        // Re-enable the option in the multiselect
                        multiselect.find(`option[value="${optionValue}"]`).prop('disabled', false);
                    });
                    
                    // disable the options that are already selected
                    $(label).find('.cart').find('option').each(function() {
                        const value = $(this).val();
                        multiselect.find(`option[value="${value}"]`).prop('disabled', true);
                    });
                    
                    $(label).find('.offset').val(parseInt(offset) + pageSize);

                    // If you received less than the requested pageSize, stop loading more data
                    if (req.size < pageSize) {
                        $(label).find('.isFull').val('true');
                    }
                    
                    // if the whole group is selected
                    if($(label).find('.checkbox').is(':checked'))
                    $(label).find('option').prop('disabled',true);
                    
                    $(label).find('.isLoading').val('false');
                }
            });
        }

        $('input[type="radio"]').each(function () {
            $(this).closest('label').each(function() {
                $(this).off('click');
                var checkbox = $('<input type="checkbox" class="checkbox" value="false"/>');
                var offset = $('<input type="hidden" class="offset" value="0"/>');
                var isLoading = $('<input type="hidden" class="isLoading" value="false"/>');
                var isFull = $('<input type="hidden" class="isFull" value="false"/>');
                var search = $('<input class="search" type="text" placeholder="type to search"/>');
                var multiselect = $('<select class="multiselect" multiple></select>');
                var toggleButton = $('<button type="button" class="toggle-button"><togglei class="fas fa-chevron-up"></togglei></button>');
                var groupId = $('<input class="groupId" type="hidden"/>');
                groupId.val(this.innerText.trim());
                $(this).append(groupId);
                $(this).append(checkbox);
                $(checkbox).prop('disabled',true);
                if("#requestParam._mode#" !== "assignment")
                {
                    
                    $(this).append(offset);
                    
                    $(this).append(isLoading);
                    
                    $(this).append(isFull);
                    
                    $(this).append(search);
                    
                    $(this).append(multiselect);
                    
                    $(this).append(toggleButton);
                    
                    $(checkbox).prop('disabled',false);
                }
                
                var cart = $('<div class="cart" multiple>SELECTED PERMISSIONS</div>');
                $(this).append(cart);
                
                // Add a click event to the toggle button
                toggleButton.on('click', function() {
                    const $multiselect = $(this).siblings('.multiselect');
                    const $icon = $(this).find('togglei');
                
                    // Use slideToggle for smooth animation
                    $multiselect.slideToggle(1000, function() {
                        // Callback after animation completes
                        if ($multiselect.is(':visible')) {
                            $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
                        } else {
                            $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                        }
                    });
                });

                
                // scroll
                    $(multiselect).on('scroll', function() {
                        // console.log(this.scrollTop + " " + this.clientHeight + " " + this.scrollHeight );
                        if (this.scrollTop + this.clientHeight >= this.scrollHeight - 1) {
                            console.log("Load more triggered");
                            loadData($(this).parent()); // Reuse the same function for loading more data
                        }
                    });
                    
                // search
                let typingTimeout;
                    $(search).on('input', function() {
                        console.log("On input triggered");
                        // Clear the previous timeout to reset the debounce timer
                        clearTimeout(typingTimeout);
                    
                        // Set a new timeout (300ms is typical for debounce delay)
                        typingTimeout = setTimeout(() => {
                            $(this).parent().find('.multiselect').empty(); // Clear previous options
                            $(this).parent().find('.offset').val(0); // Reset offset to 0
                            $(this).parent().find('.isFull').val('false');
                            loadData($(this).parent()); // Call the loadData function to fetch new data
                        }, 1000); // 1000ms delay after the user stops typing
                    });
                
                // Select All
                $(checkbox).on('click', function() {
                    $(cart).find('.cart-item').remove();
                    if($(this).is(':checked'))
                    {
                        $(this).parent().find('option').prop('disabled',true);
                    }
                    else
                    {
                        $(this).parent().find('option').prop('disabled',false);
                    }
                });
            });
        });
        
        $('input[type="radio"]').each(function () {
                $(this).closest('label').each(function() {
                    if("#requestParam._mode#" !== "assignment")
                    loadData(this);
                })
            })
                
        
        // preloaded data
        var entArray = $('[id$=selectedentitlements]').val().split("$%");
        var mapGrpArray = $('[id$=mappedgroups]').val().split("$%");
        for(let i=0; i<entArray.length-1; i++)
        {
            var label = $('input[type=radio][value="'+mapGrpArray[i]+'"]').parent();
            var cart = $('<div class="cart" multiple>SELECTED PERMISSIONS</div>');
            if($(label).find('.cart').length === 0)
            $(label).append(cart);
            
            const option = `<option value="${entArray[i]}">${mapGrpArray[i]} - ${entArray[i]}</option>`;
                        const removeButton = $('<span class="remove fa fa-trash"></span>'); // Create the cross button
                    
                        // Append remove button to the option
                        const cartItem = $('<div class="cart-item">').append(option).append(removeButton);
                    
                        // Add to the cart
                        $(label).find('.cart').append(cartItem);
        }
        var selgrplist = $('[id$=selectedgrouplist]').val().split("$%");
        for(let i=0; i<selgrplist.length-1; i++)
        {
            var label = $('input[type=radio][value="'+selgrplist[i]+'"]').parent();
            $(label).find('.checkbox').prop('checked',true);
            $(label).find('option').prop('disabled',true);
        }
    })
