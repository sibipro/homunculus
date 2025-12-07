11/29/25, 4:38 PM                                                                   API Reference - OpenAI API




      Streaming events
      When you create a Response with stream set to true , the server will emit server-sent events
      to the client as the Response is generated. This section contains the events that are emitted by
      the server.

      Learn more about streaming responses.




      response.created
      An event that is emitted when a response is created.


      response object
      The response that was created.
         Show properties



      sequence_number integer
      The sequence number for this event.


      type string
      The type of the event. Always response.created .


         OBJECT response.created


          1 {
          2   "type": "response.created",
          3   "response": {
          4     "id": "resp_67ccfcdd16748190a91872c75d38539e09e4d4aac714747c",
          5     "object": "response",
          6     "created_at": 1741487325,
          7     "status": "in_progress",
          8     "error": null,
          9     "incomplete_details": null,
          10    "instructions": null,
          11    "max_output_tokens": null,
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          1/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

          12     "model": "gpt-4o-2024-08-06",
          13     "output": [],
          14     "parallel_tool_calls": true,
          15     "previous_response_id": null,
          16     "reasoning": {
          17       "effort": null,
          18       "summary": null
          19     },
          20     "store": true,
          21     "temperature": 1,
          22     "text": {
          23       "format": {
          24         "type": "text"
          25       }
          26     },
          27     "tool_choice": "auto",
          28     "tools": [],
          29     "top_p": 1,
          30     "truncation": "disabled",
          31     "usage": null,
          32     "user": null,
          33     "metadata": {}
          34   },
          35   "sequence_number": 1
          36 }




      response.in_progress
      Emitted when the response is in progress.


      response object
      The response that is in progress.
         Show properties



      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.in_progress .


         OBJECT response.in_progress


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          2/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


          1 {
          2    "type": "response.in_progress",
          3    "response": {
          4      "id": "resp_67ccfcdd16748190a91872c75d38539e09e4d4aac714747c",
          5      "object": "response",
          6      "created_at": 1741487325,
          7      "status": "in_progress",
          8      "error": null,
          9      "incomplete_details": null,
          10     "instructions": null,
          11     "max_output_tokens": null,
          12     "model": "gpt-4o-2024-08-06",
          13     "output": [],
          14     "parallel_tool_calls": true,
          15     "previous_response_id": null,
          16     "reasoning": {
          17       "effort": null,
          18       "summary": null
          19     },
          20     "store": true,
          21     "temperature": 1,
          22     "text": {
          23       "format": {
          24         "type": "text"
          25       }
          26     },
          27     "tool_choice": "auto",
          28     "tools": [],
          29     "top_p": 1,
          30     "truncation": "disabled",
          31     "usage": null,
          32     "user": null,
          33     "metadata": {}
          34   },
          35   "sequence_number": 1
          36 }




      response.completed
      Emitted when the model response is complete.


      response object
      Properties of the completed response.

https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          3/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

         Show properties



      sequence_number integer
      The sequence number for this event.


      type string
      The type of the event. Always response.completed .


         OBJECT response.completed


          1 {
          2   "type": "response.completed",
          3   "response": {
          4     "id": "resp_123",
          5     "object": "response",
          6     "created_at": 1740855869,
          7     "status": "completed",
          8     "error": null,
          9     "incomplete_details": null,
          10    "input": [],
          11    "instructions": null,
          12    "max_output_tokens": null,
          13    "model": "gpt-4o-mini-2024-07-18",
          14    "output": [
          15      {
          16        "id": "msg_123",
          17        "type": "message",
          18        "role": "assistant",
          19        "content": [
          20          {
          21            "type": "output_text",
          22            "text": "In a shimmering forest under a sky full of stars, a lonely
          23            "annotations": []
          24          }
          25        ]
          26      }
          27    ],
          28    "previous_response_id": null,
          29    "reasoning_effort": null,
          30    "store": false,
          31    "temperature": 1,
          32    "text": {
          33      "format": {
          34        "type": "text"
          35      }
          36    },
          37    "tool_choice": "auto",
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          4/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

          38     "tools": [],
          39     "top_p": 1,
          40     "truncation": "disabled",
          41     "usage": {
          42       "input_tokens": 0,
          43       "output_tokens": 0,
          44       "output_tokens_details": {
          45         "reasoning_tokens": 0
          46       },
          47       "total_tokens": 0
          48     },
          49     "user": null,
          50     "metadata": {}
          51   },
          52   "sequence_number": 1
          53 }




      response.failed
      An event that is emitted when a response fails.


      response object
      The response that failed.
         Show properties



      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.failed .


         OBJECT response.failed


          1     {
          2         "type": "response.failed",
          3         "response": {
          4           "id": "resp_123",
          5           "object": "response",
          6           "created_at": 1740855869,
          7           "status": "failed",
          8           "error": {
          9             "code": "server_error",
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          5/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

          10       "message": "The model failed to generate a response."
          11     },
          12     "incomplete_details": null,
          13     "instructions": null,
          14     "max_output_tokens": null,
          15     "model": "gpt-4o-mini-2024-07-18",
          16     "output": [],
          17     "previous_response_id": null,
          18     "reasoning_effort": null,
          19     "store": false,
          20     "temperature": 1,
          21     "text": {
          22       "format": {
          23         "type": "text"
          24       }
          25     },
          26     "tool_choice": "auto",
          27     "tools": [],
          28     "top_p": 1,
          29     "truncation": "disabled",
          30     "usage": null,
          31     "user": null,
          32     "metadata": {}
          33   }
          34 }




      response.incomplete
      An event that is emitted when a response finishes as incomplete.


      response object
      The response that was incomplete.
         Show properties



      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.incomplete .


         OBJECT response.incomplete


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          6/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


          1 {
          2    "type": "response.incomplete",
          3    "response": {
          4      "id": "resp_123",
          5      "object": "response",
          6      "created_at": 1740855869,
          7      "status": "incomplete",
          8      "error": null,
          9      "incomplete_details": {
          10       "reason": "max_tokens"
          11     },
          12     "instructions": null,
          13     "max_output_tokens": null,
          14     "model": "gpt-4o-mini-2024-07-18",
          15     "output": [],
          16     "previous_response_id": null,
          17     "reasoning_effort": null,
          18     "store": false,
          19     "temperature": 1,
          20     "text": {
          21       "format": {
          22         "type": "text"
          23       }
          24     },
          25     "tool_choice": "auto",
          26     "tools": [],
          27     "top_p": 1,
          28     "truncation": "disabled",
          29     "usage": null,
          30     "user": null,
          31     "metadata": {}
          32   },
          33   "sequence_number": 1
          34 }




      response.output_item.added
      Emitted when a new output item is added.


      item object
      The output item that was added.

https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          7/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

         Show possible types



      output_index integer
      The index of the output item that was added.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.output_item.added .


         OBJECT response.output_item.added


          1 {
          2    "type": "response.output_item.added",
          3    "output_index": 0,
          4    "item": {
          5      "id": "msg_123",
          6      "status": "in_progress",
          7      "type": "message",
          8      "role": "assistant",
          9      "content": []
          10   },
          11   "sequence_number": 1
          12 }




      response.output_item.done
      Emitted when an output item is marked done.


      item object
      The output item that was marked done.
         Show possible types



      output_index integer
      The index of the output item that was marked done.


      sequence_number integer
      The sequence number of this event.


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          8/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      type string
      The type of the event. Always response.output_item.done .


         OBJECT response.output_item.done


          1 {
          2    "type": "response.output_item.done",
          3    "output_index": 0,
          4    "item": {
          5      "id": "msg_123",
          6      "status": "completed",
          7      "type": "message",
          8      "role": "assistant",
          9      "content": [
          10       {
          11         "type": "output_text",
          12         "text": "In a shimmering forest under a sky full of stars, a lonely uni
          13         "annotations": []
          14       }
          15     ]
          16   },
          17   "sequence_number": 1
          18 }




      response.content_part.added
      Emitted when a new content part is added.


      content_index integer
      The index of the content part that was added.


      item_id string
      The ID of the output item that the content part was added to.


      output_index integer
      The index of the output item that the content part was added to.


      part object
      The content part that was added.

https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          9/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

         Show possible types



      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.content_part.added .


         OBJECT response.content_part.added


          1 {
          2    "type": "response.content_part.added",
          3    "item_id": "msg_123",
          4    "output_index": 0,
          5    "content_index": 0,
          6    "part": {
          7      "type": "output_text",
          8      "text": "",
          9      "annotations": []
          10   },
          11   "sequence_number": 1
          12 }




      response.content_part.done
      Emitted when a content part is done.


      content_index integer
      The index of the content part that is done.


      item_id string
      The ID of the output item that the content part was added to.


      output_index integer
      The index of the output item that the content part was added to.


      part object
      The content part that is done.
         Show possible types


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          10/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.content_part.done .


         OBJECT response.content_part.done


          1 {
          2    "type": "response.content_part.done",
          3    "item_id": "msg_123",
          4    "output_index": 0,
          5    "content_index": 0,
          6    "sequence_number": 1,
          7    "part": {
          8      "type": "output_text",
          9      "text": "In a shimmering forest under a sky full of stars, a lonely unicorn
          10     "annotations": []
          11   }
          12 }




      response.output_text.delta
      Emitted when there is an additional text delta.


      content_index integer
      The index of the content part that the text delta was added to.


      delta string
      The text delta that was added.


      item_id string
      The ID of the output item that the text delta was added to.


      logprobs array
      The log probabilities of the tokens in the delta.
         Show properties



      output_index integer
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          11/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      The index of the output item that the text delta was added to.


      sequence_number integer
      The sequence number for this event.


      type string
      The type of the event. Always response.output_text.delta .


         OBJECT response.output_text.delta


          1 {
          2   "type": "response.output_text.delta",
          3   "item_id": "msg_123",
          4   "output_index": 0,
          5   "content_index": 0,
          6   "delta": "In",
          7   "sequence_number": 1
          8 }




      response.output_text.done
      Emitted when text content is finalized.


      content_index integer
      The index of the content part that the text content is finalized.


      item_id string
      The ID of the output item that the text content is finalized.


      logprobs array
      The log probabilities of the tokens in the delta.
         Show properties



      output_index integer
      The index of the output item that the text content is finalized.


      sequence_number integer
      The sequence number for this event.


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          12/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      text string
      The text content that is finalized.


      type string
      The type of the event. Always response.output_text.done .


         OBJECT response.output_text.done


          1 {
          2   "type": "response.output_text.done",
          3   "item_id": "msg_123",
          4   "output_index": 0,
          5   "content_index": 0,
          6   "text": "In a shimmering forest under a sky full of stars, a lonely unicorn na
          7   "sequence_number": 1
          8 }




      response.refusal.delta
      Emitted when there is a partial refusal text.


      content_index integer
      The index of the content part that the refusal text is added to.


      delta string
      The refusal text that is added.


      item_id string
      The ID of the output item that the refusal text is added to.


      output_index integer
      The index of the output item that the refusal text is added to.


      sequence_number integer
      The sequence number of this event.


      type string

https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          13/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      The type of the event. Always response.refusal.delta .


         OBJECT response.refusal.delta


          1 {
          2   "type": "response.refusal.delta",
          3   "item_id": "msg_123",
          4   "output_index": 0,
          5   "content_index": 0,
          6   "delta": "refusal text so far",
          7   "sequence_number": 1
          8 }




      response.refusal.done
      Emitted when refusal text is finalized.


      content_index integer
      The index of the content part that the refusal text is finalized.


      item_id string
      The ID of the output item that the refusal text is finalized.


      output_index integer
      The index of the output item that the refusal text is finalized.


      refusal string
      The refusal text that is finalized.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.refusal.done .


         OBJECT response.refusal.done


          1 {
          2   "type": "response.refusal.done",

https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          14/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

          3   "item_id": "item-abc",
          4   "output_index": 1,
          5   "content_index": 2,
          6   "refusal": "final refusal text",
          7   "sequence_number": 1
          8 }




      response.function_call_arguments.delta
      Emitted when there is a partial function-call arguments delta.


      delta string
      The function-call arguments delta that is added.


      item_id string
      The ID of the output item that the function-call arguments delta is added to.


      output_index integer
      The index of the output item that the function-call arguments delta is added to.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.function_call_arguments.delta .


         OBJECT response.function_call_arguments.delta


          1 {
          2   "type": "response.function_call_arguments.delta",
          3   "item_id": "item-abc",
          4   "output_index": 0,
          5   "delta": "{ \"arg\":"
          6   "sequence_number": 1
          7 }




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          15/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      response.function_call_arguments.done
      Emitted when function-call arguments are finalized.


      arguments string
      The function-call arguments.


      item_id string
      The ID of the item.


      name string
      The name of the function that was called.


      output_index integer
      The index of the output item.


      sequence_number integer
      The sequence number of this event.


      type string


         OBJECT response.function_call_arguments.done


          1 {
          2   "type": "response.function_call_arguments.done",
          3   "item_id": "item-abc",
          4   "name": "get_weather",
          5   "output_index": 1,
          6   "arguments": "{ \"arg\": 123 }",
          7   "sequence_number": 1
          8 }




      response.file_search_call.in_progress
      Emitted when a file search call is initiated.


      item_id string
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          16/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      The ID of the output item that the file search call is initiated.


      output_index integer
      The index of the output item that the file search call is initiated.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.file_search_call.in_progress .


         OBJECT response.file_search_call.in_progress


          1 {
          2   "type": "response.file_search_call.in_progress",
          3   "output_index": 0,
          4   "item_id": "fs_123",
          5   "sequence_number": 1
          6 }




      response.file_search_call.searching
      Emitted when a file search is currently searching.


      item_id string
      The ID of the output item that the file search call is initiated.


      output_index integer
      The index of the output item that the file search call is searching.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.file_search_call.searching .


         OBJECT response.file_search_call.searching




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          17/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


          1 {
          2   "type": "response.file_search_call.searching",
          3   "output_index": 0,
          4   "item_id": "fs_123",
          5   "sequence_number": 1
          6 }




      response.file_search_call.completed
      Emitted when a file search call is completed (results found).


      item_id string
      The ID of the output item that the file search call is initiated.


      output_index integer
      The index of the output item that the file search call is initiated.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.file_search_call.completed .


         OBJECT response.file_search_call.completed


          1 {
          2   "type": "response.file_search_call.completed",
          3   "output_index": 0,
          4   "item_id": "fs_123",
          5   "sequence_number": 1
          6 }




      response.web_search_call.in_progress
      Emitted when a web search call is initiated.
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          18/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      item_id string
      Unique ID for the output item associated with the web search call.


      output_index integer
      The index of the output item that the web search call is associated with.


      sequence_number integer
      The sequence number of the web search call being processed.


      type string
      The type of the event. Always response.web_search_call.in_progress .


         OBJECT response.web_search_call.in_progress


          1 {
          2   "type": "response.web_search_call.in_progress",
          3   "output_index": 0,
          4   "item_id": "ws_123",
          5   "sequence_number": 0
          6 }




      response.web_search_call.searching
      Emitted when a web search call is executing.


      item_id string
      Unique ID for the output item associated with the web search call.


      output_index integer
      The index of the output item that the web search call is associated with.


      sequence_number integer
      The sequence number of the web search call being processed.


      type string
      The type of the event. Always response.web_search_call.searching .



https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          19/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

         OBJECT response.web_search_call.searching


          1 {
          2   "type": "response.web_search_call.searching",
          3   "output_index": 0,
          4   "item_id": "ws_123",
          5   "sequence_number": 0
          6 }




      response.web_search_call.completed
      Emitted when a web search call is completed.


      item_id string
      Unique ID for the output item associated with the web search call.


      output_index integer
      The index of the output item that the web search call is associated with.


      sequence_number integer
      The sequence number of the web search call being processed.


      type string
      The type of the event. Always response.web_search_call.completed .


         OBJECT response.web_search_call.completed


          1 {
          2   "type": "response.web_search_call.completed",
          3   "output_index": 0,
          4   "item_id": "ws_123",
          5   "sequence_number": 0
          6 }




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          20/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      response.reasoning_summary_part.added
      Emitted when a new reasoning summary part is added.


      item_id string
      The ID of the item this summary part is associated with.


      output_index integer
      The index of the output item this summary part is associated with.


      part object
      The summary part that was added.
         Show properties



      sequence_number integer
      The sequence number of this event.


      summary_index integer
      The index of the summary part within the reasoning summary.


      type string
      The type of the event. Always response.reasoning_summary_part.added .


         OBJECT response.reasoning_summary_part.added


          1 {
          2    "type": "response.reasoning_summary_part.added",
          3    "item_id": "rs_6806bfca0b2481918a5748308061a2600d3ce51bdffd5476",
          4    "output_index": 0,
          5    "summary_index": 0,
          6    "part": {
          7      "type": "summary_text",
          8      "text": ""
          9    },
          10   "sequence_number": 1
          11 }




      response.reasoning_summary_part.done
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          21/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      Emitted when a reasoning summary part is completed.


      item_id string
      The ID of the item this summary part is associated with.


      output_index integer
      The index of the output item this summary part is associated with.


      part object
      The completed summary part.
         Show properties



      sequence_number integer
      The sequence number of this event.


      summary_index integer
      The index of the summary part within the reasoning summary.


      type string
      The type of the event. Always response.reasoning_summary_part.done .


         OBJECT response.reasoning_summary_part.done


          1 {
          2    "type": "response.reasoning_summary_part.done",
          3    "item_id": "rs_6806bfca0b2481918a5748308061a2600d3ce51bdffd5476",
          4    "output_index": 0,
          5    "summary_index": 0,
          6    "part": {
          7      "type": "summary_text",
          8      "text": "**Responding to a greeting**\n\nThe user just said, \"Hello!\" So,
          9    },
          10   "sequence_number": 1
          11 }




      response.reasoning_summary_text.delta
      Emitted when a delta is added to a reasoning summary text.
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          22/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      delta string
      The text delta that was added to the summary.


      item_id string
      The ID of the item this summary text delta is associated with.


      output_index integer
      The index of the output item this summary text delta is associated with.


      sequence_number integer
      The sequence number of this event.


      summary_index integer
      The index of the summary part within the reasoning summary.


      type string
      The type of the event. Always response.reasoning_summary_text.delta .


         OBJECT response.reasoning_summary_text.delta


          1 {
          2   "type": "response.reasoning_summary_text.delta",
          3   "item_id": "rs_6806bfca0b2481918a5748308061a2600d3ce51bdffd5476",
          4   "output_index": 0,
          5   "summary_index": 0,
          6   "delta": "**Responding to a greeting**\n\nThe user just said, \"Hello!\" So, i
          7   "sequence_number": 1
          8 }




      response.reasoning_summary_text.done
      Emitted when a reasoning summary text is completed.


      item_id string
      The ID of the item this summary text is associated with.


      output_index integer


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          23/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      The index of the output item this summary text is associated with.


      sequence_number integer
      The sequence number of this event.


      summary_index integer
      The index of the summary part within the reasoning summary.


      text string
      The full text of the completed reasoning summary.


      type string
      The type of the event. Always response.reasoning_summary_text.done .


         OBJECT response.reasoning_summary_text.done


          1 {
          2   "type": "response.reasoning_summary_text.done",
          3   "item_id": "rs_6806bfca0b2481918a5748308061a2600d3ce51bdffd5476",
          4   "output_index": 0,
          5   "summary_index": 0,
          6   "text": "**Responding to a greeting**\n\nThe user just said, \"Hello!\" So, it
          7   "sequence_number": 1
          8 }




      response.reasoning_text.delta
      Emitted when a delta is added to a reasoning text.


      content_index integer
      The index of the reasoning content part this delta is associated with.


      delta string
      The text delta that was added to the reasoning content.


      item_id string
      The ID of the item this reasoning text delta is associated with.


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          24/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      output_index integer
      The index of the output item this reasoning text delta is associated with.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always response.reasoning_text.delta .


         OBJECT response.reasoning_text.delta


          1 {
          2   "type": "response.reasoning_text.delta",
          3   "item_id": "rs_123",
          4   "output_index": 0,
          5   "content_index": 0,
          6   "delta": "The",
          7   "sequence_number": 1
          8 }




      response.reasoning_text.done
      Emitted when a reasoning text is completed.


      content_index integer
      The index of the reasoning content part.


      item_id string
      The ID of the item this reasoning text is associated with.


      output_index integer
      The index of the output item this reasoning text is associated with.


      sequence_number integer
      The sequence number of this event.


      text string
      The full text of the completed reasoning content.


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          25/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      type string
      The type of the event. Always response.reasoning_text.done .


         OBJECT response.reasoning_text.done


          1 {
          2   "type": "response.reasoning_text.done",
          3   "item_id": "rs_123",
          4   "output_index": 0,
          5   "content_index": 0,
          6   "text": "The user is asking...",
          7   "sequence_number": 4
          8 }




      response.image_generation_call.completed
      Emitted when an image generation tool call has completed and the final image is available.


      item_id string
      The unique identifier of the image generation item being processed.


      output_index integer
      The index of the output item in the response's output array.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.image_generation_call.completed'.


         OBJECT response.image_generation_call.completed




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          26/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


          1 {
          2   "type": "response.image_generation_call.completed",
          3   "output_index": 0,
          4   "item_id": "item-123",
          5   "sequence_number": 1
          6 }




      response.image_generation_call.generating
      Emitted when an image generation tool call is actively generating an image (intermediate state).


      item_id string
      The unique identifier of the image generation item being processed.


      output_index integer
      The index of the output item in the response's output array.


      sequence_number integer
      The sequence number of the image generation item being processed.


      type string
      The type of the event. Always 'response.image_generation_call.generating'.


         OBJECT response.image_generation_call.generating


          1 {
          2   "type": "response.image_generation_call.generating",
          3   "output_index": 0,
          4   "item_id": "item-123",
          5   "sequence_number": 0
          6 }




      response.image_generation_call.in_progress
      Emitted when an image generation tool call is in progress.


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          27/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      item_id string
      The unique identifier of the image generation item being processed.


      output_index integer
      The index of the output item in the response's output array.


      sequence_number integer
      The sequence number of the image generation item being processed.


      type string
      The type of the event. Always 'response.image_generation_call.in_progress'.


         OBJECT response.image_generation_call.in_progress


          1 {
          2   "type": "response.image_generation_call.in_progress",
          3   "output_index": 0,
          4   "item_id": "item-123",
          5   "sequence_number": 0
          6 }




      response.image_generation_call.partial_image
      Emitted when a partial image is available during image generation streaming.


      item_id string
      The unique identifier of the image generation item being processed.


      output_index integer
      The index of the output item in the response's output array.


      partial_image_b64 string
      Base64-encoded partial image data, suitable for rendering as an image.


      partial_image_index integer
      0-based index for the partial image (backend is 1-based, but this is 0-based for the user).


      sequence_number integer

https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          28/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      The sequence number of the image generation item being processed.


      type string
      The type of the event. Always 'response.image_generation_call.partial_image'.


         OBJECT response.image_generation_call.partial_image


          1 {
          2   "type": "response.image_generation_call.partial_image",
          3   "output_index": 0,
          4   "item_id": "item-123",
          5   "sequence_number": 0,
          6   "partial_image_index": 0,
          7   "partial_image_b64": "..."
          8 }




      response.mcp_call_arguments.delta
      Emitted when there is a delta (partial update) to the arguments of an MCP tool call.


      delta string
      A JSON string containing the partial update to the arguments for the MCP tool call.


      item_id string
      The unique identifier of the MCP tool call item being processed.


      output_index integer
      The index of the output item in the response's output array.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_call_arguments.delta'.


         OBJECT response.mcp_call_arguments.delta




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          29/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


          1 {
          2   "type": "response.mcp_call_arguments.delta",
          3   "output_index": 0,
          4   "item_id": "item-abc",
          5   "delta": "{",
          6   "sequence_number": 1
          7 }




      response.mcp_call_arguments.done
      Emitted when the arguments for an MCP tool call are finalized.


      arguments string
      A JSON string containing the finalized arguments for the MCP tool call.


      item_id string
      The unique identifier of the MCP tool call item being processed.


      output_index integer
      The index of the output item in the response's output array.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_call_arguments.done'.


         OBJECT response.mcp_call_arguments.done


          1 {
          2   "type": "response.mcp_call_arguments.done",
          3   "output_index": 0,
          4   "item_id": "item-abc",
          5   "arguments": "{\"arg1\": \"value1\", \"arg2\": \"value2\"}",
          6   "sequence_number": 1
          7 }




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          30/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API




      response.mcp_call.completed
      Emitted when an MCP tool call has completed successfully.


      item_id string
      The ID of the MCP tool call item that completed.


      output_index integer
      The index of the output item that completed.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_call.completed'.


         OBJECT response.mcp_call.completed


          1 {
          2   "type": "response.mcp_call.completed",
          3   "sequence_number": 1,
          4   "item_id": "mcp_682d437d90a88191bf88cd03aae0c3e503937d5f622d7a90",
          5   "output_index": 0
          6 }




      response.mcp_call.failed
      Emitted when an MCP tool call has failed.


      item_id string
      The ID of the MCP tool call item that failed.


      output_index integer
      The index of the output item that failed.


      sequence_number integer


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          31/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_call.failed'.


         OBJECT response.mcp_call.failed


          1 {
          2   "type": "response.mcp_call.failed",
          3   "sequence_number": 1,
          4   "item_id": "mcp_682d437d90a88191bf88cd03aae0c3e503937d5f622d7a90",
          5   "output_index": 0
          6 }




      response.mcp_call.in_progress
      Emitted when an MCP tool call is in progress.


      item_id string
      The unique identifier of the MCP tool call item being processed.


      output_index integer
      The index of the output item in the response's output array.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_call.in_progress'.


         OBJECT response.mcp_call.in_progress


          1 {
          2   "type": "response.mcp_call.in_progress",
          3   "sequence_number": 1,
          4   "output_index": 0,
          5   "item_id": "mcp_682d437d90a88191bf88cd03aae0c3e503937d5f622d7a90"
          6 }




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          32/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API




      response.mcp_list_tools.completed
      Emitted when the list of available MCP tools has been successfully retrieved.


      item_id string
      The ID of the MCP tool call item that produced this output.


      output_index integer
      The index of the output item that was processed.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_list_tools.completed'.


         OBJECT response.mcp_list_tools.completed


          1 {
          2   "type": "response.mcp_list_tools.completed",
          3   "sequence_number": 1,
          4   "output_index": 0,
          5   "item_id": "mcpl_682d4379df088191886b70f4ec39f90403937d5f622d7a90"
          6 }




      response.mcp_list_tools.failed
      Emitted when the attempt to list available MCP tools has failed.


      item_id string
      The ID of the MCP tool call item that failed.


      output_index integer
      The index of the output item that failed.



https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          33/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_list_tools.failed'.


         OBJECT response.mcp_list_tools.failed


          1 {
          2   "type": "response.mcp_list_tools.failed",
          3   "sequence_number": 1,
          4   "output_index": 0,
          5   "item_id": "mcpl_682d4379df088191886b70f4ec39f90403937d5f622d7a90"
          6 }




      response.mcp_list_tools.in_progress
      Emitted when the system is in the process of retrieving the list of available MCP tools.


      item_id string
      The ID of the MCP tool call item that is being processed.


      output_index integer
      The index of the output item that is being processed.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.mcp_list_tools.in_progress'.


         OBJECT response.mcp_list_tools.in_progress




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          34/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


          1 {
          2   "type": "response.mcp_list_tools.in_progress",
          3   "sequence_number": 1,
          4   "output_index": 0,
          5   "item_id": "mcpl_682d4379df088191886b70f4ec39f90403937d5f622d7a90"
          6 }




      response.code_interpreter_call.in_progress
      Emitted when a code interpreter call is in progress.


      item_id string
      The unique identifier of the code interpreter tool call item.


      output_index integer
      The index of the output item in the response for which the code interpreter call is in progress.


      sequence_number integer
      The sequence number of this event, used to order streaming events.


      type string
      The type of the event. Always response.code_interpreter_call.in_progress .


         OBJECT response.code_interpreter_call.in_progress


          1 {
          2   "type": "response.code_interpreter_call.in_progress",
          3   "output_index": 0,
          4   "item_id": "ci_12345",
          5   "sequence_number": 1
          6 }




      response.code_interpreter_call.interpreting
      Emitted when the code interpreter is actively interpreting the code snippet.
https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          35/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      item_id string
      The unique identifier of the code interpreter tool call item.


      output_index integer
      The index of the output item in the response for which the code interpreter is interpreting code.


      sequence_number integer
      The sequence number of this event, used to order streaming events.


      type string
      The type of the event. Always response.code_interpreter_call.interpreting .


         OBJECT response.code_interpreter_call.interpreting


          1 {
          2   "type": "response.code_interpreter_call.interpreting",
          3   "output_index": 4,
          4   "item_id": "ci_12345",
          5   "sequence_number": 1
          6 }




      response.code_interpreter_call.completed
      Emitted when the code interpreter call is completed.


      item_id string
      The unique identifier of the code interpreter tool call item.


      output_index integer
      The index of the output item in the response for which the code interpreter call is completed.


      sequence_number integer
      The sequence number of this event, used to order streaming events.


      type string
      The type of the event. Always response.code_interpreter_call.completed .



https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          36/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

         OBJECT response.code_interpreter_call.completed


          1 {
          2   "type": "response.code_interpreter_call.completed",
          3   "output_index": 5,
          4   "item_id": "ci_12345",
          5   "sequence_number": 1
          6 }




      response.code_interpreter_call_code.delta
      Emitted when a partial code snippet is streamed by the code interpreter.


      delta string
      The partial code snippet being streamed by the code interpreter.


      item_id string
      The unique identifier of the code interpreter tool call item.


      output_index integer
      The index of the output item in the response for which the code is being streamed.


      sequence_number integer
      The sequence number of this event, used to order streaming events.


      type string
      The type of the event. Always response.code_interpreter_call_code.delta .


         OBJECT response.code_interpreter_call_code.delta




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          37/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


          1 {
          2   "type": "response.code_interpreter_call_code.delta",
          3   "output_index": 0,
          4   "item_id": "ci_12345",
          5   "delta": "print('Hello, world')",
          6   "sequence_number": 1
          7 }




      response.code_interpreter_call_code.done
      Emitted when the code snippet is finalized by the code interpreter.


      code string
      The final code snippet output by the code interpreter.


      item_id string
      The unique identifier of the code interpreter tool call item.


      output_index integer
      The index of the output item in the response for which the code is finalized.


      sequence_number integer
      The sequence number of this event, used to order streaming events.


      type string
      The type of the event. Always response.code_interpreter_call_code.done .


         OBJECT response.code_interpreter_call_code.done


          1 {
          2   "type": "response.code_interpreter_call_code.done",
          3   "output_index": 3,
          4   "item_id": "ci_12345",
          5   "code": "print('done')",
          6   "sequence_number": 1
          7 }




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          38/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API




      response.output_text.annotation.added
      Emitted when an annotation is added to output text content.


      annotation object
      The annotation object being added. (See annotation schema for details.)


      annotation_index integer
      The index of the annotation within the content part.


      content_index integer
      The index of the content part within the output item.


      item_id string
      The unique identifier of the item to which the annotation is being added.


      output_index integer
      The index of the output item in the response's output array.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always 'response.output_text.annotation.added'.


         OBJECT response.output_text.annotation.added


          1 {
          2   "type": "response.output_text.annotation.added",
          3   "item_id": "item-abc",
          4   "output_index": 0,
          5   "content_index": 0,
          6   "annotation_index": 0,
          7   "annotation": {
          8     "type": "text_annotation",
          9     "text": "This is a test annotation",
          10    "start": 0,
          11    "end": 10
          12  },

https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          39/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

          13   "sequence_number": 1
          14 }




      response.queued
      Emitted when a response is queued and waiting to be processed.


      response object
      The full response object that is queued.
         Show properties



      sequence_number integer
      The sequence number for this event.


      type string
      The type of the event. Always 'response.queued'.


         OBJECT response.queued


          1 {
          2    "type": "response.queued",
          3    "response": {
          4      "id": "res_123",
          5      "status": "queued",
          6      "created_at": "2021-01-01T00:00:00Z",
          7      "updated_at": "2021-01-01T00:00:00Z"
          8    },
          9    "sequence_number": 1
          10 }




      response.custom_tool_call_input.delta
      Event representing a delta (partial update) to the input of a custom tool call.


      delta string


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          40/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

      The incremental input data (delta) for the custom tool call.


      item_id string
      Unique identifier for the API item associated with this event.


      output_index integer
      The index of the output this delta applies to.


      sequence_number integer
      The sequence number of this event.


      type string
      The event type identifier.


         OBJECT response.custom_tool_call_input.delta


          1 {
          2   "type": "response.custom_tool_call_input.delta",
          3   "output_index": 0,
          4   "item_id": "ctc_1234567890abcdef",
          5   "delta": "partial input text"
          6 }




      response.custom_tool_call_input.done
      Event indicating that input for a custom tool call is complete.


      input string
      The complete input data for the custom tool call.


      item_id string
      Unique identifier for the API item associated with this event.


      output_index integer
      The index of the output this event applies to.


      sequence_number integer
      The sequence number of this event.


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          41/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API


      type string
      The event type identifier.


         OBJECT response.custom_tool_call_input.done


          1 {
          2   "type": "response.custom_tool_call_input.done",
          3   "output_index": 0,
          4   "item_id": "ctc_1234567890abcdef",
          5   "input": "final complete input text"
          6 }




      error
      Emitted when an error occurs.


      code string
      The error code.


      message string
      The error message.


      param string
      The error parameter.


      sequence_number integer
      The sequence number of this event.


      type string
      The type of the event. Always error .


         OBJECT error


          1 {
          2   "type": "error",
          3   "code": "ERR_SOMETHING",
          4   "message": "Something went wrong",
          5   "param": null,


https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                          42/43
11/29/25, 4:38 PM                                                                   API Reference - OpenAI API

          6   "sequence_number": 1
          7 }


               PREVIOUS                                                                                                    NEXT

               Conversations                                                                                     Webhook Events




https://platform.openai.com/docs/api-reference/responses-streaming/response/in_progress                                           43/43
