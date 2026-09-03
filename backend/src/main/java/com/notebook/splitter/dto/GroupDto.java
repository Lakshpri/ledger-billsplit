package com.notebook.splitter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String baseCurrency;
    private UserDto createdBy;
    private List<UserDto> members;
    private Instant createdAt;
}
