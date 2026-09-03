package com.notebook.splitter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class GroupRequest {
    @NotBlank(message = "Group name is required")
    private String name;

    private String description;
    private String icon;
    private String baseCurrency;

    // Emails of members to invite when creating the group (creator is added automatically)
    private List<String> memberEmails;
}
