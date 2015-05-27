# Shaker2
Shaker2 services and web

####话题审核通过、审核不通过、设置为精选、修改点赞数

    PUT /services/entity

    #### 参数

    * type
    > _Optional_ __string__ - 传想修改到的类型.

    * status
    > _Optional_ __string__ - 传'accept'表示“审核通过”，传'reject'表示“审核不通过”.

    * likeCount
    > _Optional_ __number__ - 传想修改到的数值.

    * isSelected
    > _Optional_ __bool__ - 传'true'表示设置为“精选话题”.

    #### 参数举例

    ```json
    {
        "type": "anti-realism",
        "status": "accept",
        "likeCount": 200,
        "isSelected": true
    }
    ```


####话题删除

    DELETE /services/entity/:id

    #### 请求举例

    $.delete('/services/entity/bf7ea10f-54b0-414b-8d3e-25bae7ca81bf')


####回复审核通过、审核不通过、修改点赞数

    PUT /services/post

    #### 参数

    * status
    > _Optional_ __string__ - 传'accept'表示“审核通过”，传'reject'表示“审核不通过”.

    * likeCount
    > _Optional_ __number__ - 传想修改到的数值.

    #### 参数举例

    ```json
    {
        "status": "accept",
        "likeCount": 200
    }
    ```


####回复删除

    DELETE /services/post/:id

    #### 请求举例

    $.delete('/services/post/ba3174a9-a7d6-4992-a6ba-20d611034b5f')

